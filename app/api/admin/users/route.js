const User = require("../../../../models/User");
const { hashPassword } = require("../../../../lib/auth");
const { initDb } = require("../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../lib/crud");
const { requireAdminRestaurantId } = require("../../../../lib/adminRestaurant");

export async function GET(request) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const users = await User.find({ restaurantId: requireAdminRestaurantId(decoded) }).select("-passwordHash").sort({ createdAt: -1 }).lean();
    return Response.json({ data: users });
  } catch (error) {
    return handleRouteError(error, "Users list failed");
  }
}

export async function POST(request) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const body = await request.json();
    if (!body.name || !body.email || !body.role) {
      return Response.json({ error: "name, email and role are required" }, { status: 400 });
    }
    if (!body.password) return Response.json({ error: "password is required" }, { status: 400 });
    const passwordHash = await hashPassword(body.password);
    const user = await User.create({
      restaurantId: requireAdminRestaurantId(decoded),
      name: body.name,
      email: String(body.email || "").toLowerCase().trim(),
      passwordHash,
      role: body.role,
      assignedKitchenId: null,
    });
    const plain = user.toObject();
    delete plain.passwordHash;
    return Response.json({ data: plain });
  } catch (error) {
    return handleRouteError(error, "Create user failed");
  }
}
