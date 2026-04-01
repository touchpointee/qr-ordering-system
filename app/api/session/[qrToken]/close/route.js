const Table = require("../../../../../models/Table");
const OrderSession = require("../../../../../models/OrderSession");
const { initDb } = require("../../../../../lib/bootstrap");
const { requireStaffAuth, jsonError } = require("../../../../../lib/requestAuth");

export async function POST(request, { params }) {
  try {
    requireStaffAuth(request);
    await initDb();
    const table = await Table.findOne({ qrToken: params.qrToken });
    if (!table) return jsonError("Table not found", 404);

    const session = await OrderSession.findOneAndUpdate(
      { tableId: table._id, status: "active" },
      { $set: { status: "closed", expiresAt: new Date() } },
      { new: true }
    );

    table.currentSessionId = null;
    table.billRequested = false;
    await table.save();

    return Response.json({ success: true, sessionId: session?._id || null });
  } catch (error) {
    return jsonError(error.message || "Failed to close session", error.status || 500);
  }
}
