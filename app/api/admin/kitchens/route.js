const Kitchen = require("../../../../models/Kitchen");
const { initDb } = require("../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../lib/crud");
const { requireAdminRestaurantId } = require("../../../../lib/adminRestaurant");

export async function GET(request) {
  try {
    const decoded = requireStaffAuth(request);
    await initDb();
    const query = { restaurantId: requireAdminRestaurantId(decoded) };
    const rows = await Kitchen.find(query).sort({ createdAt: -1 }).lean();
    return Response.json({ data: rows });
  } catch (error) {
    return handleRouteError(error, "List failed");
  }
}

export async function POST(request) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const body = await request.json();
    const created = await Kitchen.create({
      restaurantId: requireAdminRestaurantId(decoded),
      name: body.name,
      description: body.description || "",
      printerId: body.printerId || null,
    });
    return Response.json({ data: created });
  } catch (error) {
    return handleRouteError(error, "Create failed");
  }
}
