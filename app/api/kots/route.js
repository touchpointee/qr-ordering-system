const KOT = require("../../../models/KOT");
const { initDb } = require("../../../lib/bootstrap");
const { handleRouteError } = require("../../../lib/crud");

export async function GET(request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const kitchenId = searchParams.get("kitchenId");
    if (!kitchenId) return Response.json({ error: "kitchenId is required" }, { status: 400 });
    const statusList = (searchParams.get("status") || "pending,printed,acknowledged")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const kots = await KOT.find({ kitchenId, status: { $in: statusList } }).sort({ createdAt: -1 }).lean();
    return Response.json({ kots });
  } catch (error) {
    return handleRouteError(error, "KOT fetch failed");
  }
}
