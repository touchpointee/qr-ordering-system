const Order = require("../../../../models/Order");
const { initDb } = require("../../../../lib/bootstrap");
const { requireStaffAuth } = require("../../../../lib/requestAuth");
const { handleRouteError, objectIdSchema } = require("../../../../lib/crud");

export async function GET(request, { params }) {
  try {
    requireStaffAuth(request);
    objectIdSchema("id").parse(params.id);
    await initDb();
    const order = await Order.findById(params.id).lean();
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    return Response.json({ order });
  } catch (error) {
    return handleRouteError(error, "Order fetch failed");
  }
}
