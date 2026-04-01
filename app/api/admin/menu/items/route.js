const MenuItem = require("../../../../../models/MenuItem");
const { initDb } = require("../../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../../lib/crud");
const { requireAdminRestaurantId } = require("../../../../../lib/adminRestaurant");

export async function GET(request) {
  try {
    const decoded = requireStaffAuth(request);
    await initDb();
    const restaurantId = requireAdminRestaurantId(decoded);
    const rows = await MenuItem.find({ restaurantId }).sort({ createdAt: -1 }).lean();
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
    const restaurantId = requireAdminRestaurantId(decoded);
    const body = await request.json();
    const created = await MenuItem.create({
      restaurantId,
      kitchenId: body.kitchenId,
      sectionId: body.sectionId || null,
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId || null,
      name: body.name,
      description: body.description || "",
      price: Number(body.price || 0),
      isAvailable: body.isAvailable !== false,
      isVeg: body.isVeg !== false,
      image: body.image || "",
    });
    return Response.json({ data: created });
  } catch (error) {
    return handleRouteError(error, "Create failed");
  }
}
