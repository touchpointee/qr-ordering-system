const Order = require("../../../models/Order");
const Table = require("../../../models/Table");
const OrderSession = require("../../../models/OrderSession");
const Restaurant = require("../../../models/Restaurant");
const { initDb } = require("../../../lib/bootstrap");
const {
  requireStaffAuth,
  requireSessionAuth,
  jsonError,
} = require("../../../lib/requestAuth");
const {
  z,
  objectIdSchema,
  parseJson,
  handleRouteError,
} = require("../../../lib/crud");
const {
  validateAndBuildLineItems,
  sumTotal,
  processOrderKots,
} = require("../../../lib/kotEngine");
const { SESSION_EXPIRY_SEC } = require("../../../lib/auth");

const postSchema = z.object({
  restaurantId: objectIdSchema("restaurantId"),
  tableId: objectIdSchema("tableId"),
  sessionId: objectIdSchema("sessionId").optional(),
  items: z
    .array(
      z.object({
        menuItemId: objectIdSchema("menuItemId"),
        kitchenId: objectIdSchema("kitchenId").optional(),
        sectionId: objectIdSchema("sectionId").optional(),
        qty: z.number().int().min(1),
        note: z.string().optional().default(""),
      })
    )
    .min(1),
});

export async function POST(request) {
  try {
    await initDb();
    const body = await parseJson(request, postSchema);
    let authMode = "customer";
    let staff = null;
    try {
      requireSessionAuth(request);
    } catch {
      staff = requireStaffAuth(request);
      authMode = "staff";
    }

    const [table, restaurant] = await Promise.all([
      Table.findById(body.tableId),
      Restaurant.findById(body.restaurantId),
    ]);
    if (!table || !restaurant) return jsonError("Invalid table/restaurant", 400);

    let session = null;
    if (body.sessionId) {
      session = await OrderSession.findById(body.sessionId);
    } else if (table.currentSessionId) {
      session = await OrderSession.findById(table.currentSessionId);
    }

    if (!session || session.status !== "active" || new Date(session.expiresAt) <= new Date()) {
      if (authMode === "staff") {
        const now = new Date();
        session = await OrderSession.create({
          tableId: table._id,
          restaurantId: table.restaurantId,
          status: "active",
          expiresAt: new Date(now.getTime() + SESSION_EXPIRY_SEC * 1000),
          createdAt: now,
        });
        table.currentSessionId = session._id;
        await table.save();
      } else {
        return jsonError("Session expired", 401);
      }
    }

    const lineItems = await validateAndBuildLineItems(body.restaurantId, body.items);
    const order = await Order.create({
      restaurantId: body.restaurantId,
      tableId: body.tableId,
      sessionId: session._id,
      placedBy: authMode,
      staffId: staff?.sub || null,
      status: "pending",
      items: lineItems,
      kotIds: [],
      totalAmount: sumTotal(lineItems),
      createdAt: new Date(),
    });

    await processOrderKots({
      order,
      restaurant,
      table,
      lineItemsInput: lineItems,
    });

    return Response.json({ success: true, orderId: order._id });
  } catch (error) {
    return handleRouteError(error, "Order create failed");
  }
}

export async function GET(request) {
  try {
    requireStaffAuth(request);
    await initDb();
    const { searchParams } = new URL(request.url);
    const query = {};
    if (searchParams.get("restaurantId")) query.restaurantId = searchParams.get("restaurantId");
    if (searchParams.get("status")) query.status = searchParams.get("status");
    if (searchParams.get("tableId")) query.tableId = searchParams.get("tableId");
    if (searchParams.get("from") || searchParams.get("to")) {
      query.createdAt = {};
      if (searchParams.get("from")) query.createdAt.$gte = new Date(searchParams.get("from"));
      if (searchParams.get("to")) query.createdAt.$lte = new Date(searchParams.get("to"));
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(500).lean();
    return Response.json({ orders });
  } catch (error) {
    return handleRouteError(error, "Orders fetch failed");
  }
}
