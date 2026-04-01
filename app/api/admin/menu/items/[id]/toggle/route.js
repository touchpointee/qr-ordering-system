const MenuItem = require("../../../../../../../models/MenuItem");
const { initDb } = require("../../../../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../../../../lib/crud");

export async function PATCH(request, { params }) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager", "waiter"]);
    await initDb();
    const item = await MenuItem.findById(params.id);
    if (!item) return Response.json({ error: "Item not found" }, { status: 404 });
    item.isAvailable = !item.isAvailable;
    await item.save();
    return Response.json({ success: true, item });
  } catch (error) {
    return handleRouteError(error, "Toggle failed");
  }
}
