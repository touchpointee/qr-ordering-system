const Table = require("../../../../models/Table");
const Restaurant = require("../../../../models/Restaurant");
const OrderSession = require("../../../../models/OrderSession");
const { initDb } = require("../../../../lib/bootstrap");
const { signSessionToken, SESSION_EXPIRY_SEC } = require("../../../../lib/auth");
const { jsonError } = require("../../../../lib/requestAuth");

export async function GET(_request, { params }) {
  try {
    await initDb();
    const table = await Table.findOne({ qrToken: params.qrToken, isActive: true });
    if (!table) return jsonError("Invalid QR token", 404);

    const restaurant = await Restaurant.findById(table.restaurantId);
    if (!restaurant?.isActive) return jsonError("Restaurant not active", 400);

    const now = new Date();
    let session = await OrderSession.findOne({
      tableId: table._id,
      status: "active",
      expiresAt: { $gt: now },
    });

    if (!session) {
      await OrderSession.updateMany({ tableId: table._id, status: "active" }, { $set: { status: "closed" } });
      session = await OrderSession.create({
        tableId: table._id,
        restaurantId: table.restaurantId,
        status: "active",
        expiresAt: new Date(now.getTime() + SESSION_EXPIRY_SEC * 1000),
        createdAt: now,
      });
      table.currentSessionId = session._id;
      await table.save();
    }

    const token = signSessionToken({
      sessionId: session._id.toString(),
      tableId: table._id.toString(),
      restaurantId: table.restaurantId.toString(),
    });

    session.sessionToken = token;
    await session.save();

    return Response.json({
      token,
      expiresInSec: SESSION_EXPIRY_SEC,
      table: { id: table._id, name: table.name },
      restaurant: { id: restaurant._id, name: restaurant.name },
      sessionId: session._id,
    });
  } catch (error) {
    return jsonError(error.message || "Failed to start session", error.status || 500);
  }
}
