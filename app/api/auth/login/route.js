const User = require("../../../../models/User");
const { initDb } = require("../../../../lib/bootstrap");
const { comparePassword, signStaffToken } = require("../../../../lib/auth");
const { jsonError } = require("../../../../lib/requestAuth");

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.email || !body.password) return jsonError("Email and password are required", 400);

    await initDb();
    const user = await User.findOne({ email: body.email.toLowerCase().trim() });
    if (!user) return jsonError("Invalid credentials", 401);

    const ok = await comparePassword(body.password, user.passwordHash);
    if (!ok) return jsonError("Invalid credentials", 401);

    const token = signStaffToken(user);
    const response = Response.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        assignedKitchenId: user.assignedKitchenId,
      },
    });

    response.headers.append(
      "Set-Cookie",
      `staff_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );

    return response;
  } catch (error) {
    return jsonError(error.message || "Login failed", error.status || 500);
  }
}
