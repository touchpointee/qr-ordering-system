const Order = require("../../../../../models/Order");
const { initDb } = require("../../../../../lib/bootstrap");
const { requireStaffAuth } = require("../../../../../lib/requestAuth");
const { z, parseJson, handleRouteError, objectIdSchema } = require("../../../../../lib/crud");
const { getIO } = require("../../../../../lib/socket");

const schema = z.object({
  status: z.enum(["pending", "preparing", "ready", "billed", "cancelled"]),
});

export async function PATCH(request, { params }) {
  try {
    requireStaffAuth(request);
    objectIdSchema("id").parse(params.id);
    const body = await parseJson(request, schema);
    await initDb();
    const order = await Order.findByIdAndUpdate(params.id, { $set: { status: body.status } }, { new: true });
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    const io = getIO();
    if (io) {
      io.to(`table_${order.tableId.toString()}`).emit("order_status", {
        orderId: order._id.toString(),
        status: order.status,
      });
    }
    return Response.json({ success: true, order });
  } catch (error) {
    return handleRouteError(error, "Order status update failed");
  }
}
