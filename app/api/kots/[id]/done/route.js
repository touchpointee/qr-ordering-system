const KOT = require("../../../../../models/KOT");
const { initDb } = require("../../../../../lib/bootstrap");
const { handleRouteError, objectIdSchema } = require("../../../../../lib/crud");
const { getIO } = require("../../../../../lib/socket");

export async function PATCH(_request, { params }) {
  try {
    objectIdSchema("id").parse(params.id);
    await initDb();
    const kot = await KOT.findByIdAndUpdate(params.id, { $set: { status: "done" } }, { new: true });
    if (!kot) return Response.json({ error: "KOT not found" }, { status: 404 });
    const io = getIO();
    if (io) {
      io.to(`kitchen_${kot.kitchenId.toString()}`).emit("kot_updated", {
        kotId: kot._id.toString(),
        status: kot.status,
      });
    }
    return Response.json({ success: true, kot });
  } catch (error) {
    return handleRouteError(error, "KOT done update failed");
  }
}
