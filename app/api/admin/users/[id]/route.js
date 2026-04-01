const User = require("../../../../../models/User");
const { hashPassword } = require("../../../../../lib/auth");
const { initDb } = require("../../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../../lib/crud");

export async function PATCH(request, { params }) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const body = await request.json();
    const update = {
      name: body.name,
      email: body.email ? String(body.email).toLowerCase().trim() : undefined,
      role: body.role,
      assignedKitchenId: null,
    };
    if (body.password) update.passwordHash = await hashPassword(body.password);
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);
    const user = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true }).select("-passwordHash");
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ data: user });
  } catch (error) {
    return handleRouteError(error, "Update user failed");
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const row = await User.findByIdAndDelete(params.id);
    if (!row) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "Delete user failed");
  }
}
