const { verifyStaffToken, verifySessionToken } = require("./auth");

function getBearerToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

function getCookieToken(request, key = "staff_token") {
  return request.cookies.get(key)?.value || null;
}

function requireStaffAuth(request) {
  const token = getBearerToken(request) || getCookieToken(request, "staff_token");
  if (!token) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  try {
    return verifyStaffToken(token);
  } catch {
    const err = new Error("Invalid token");
    err.status = 401;
    throw err;
  }
}

function requireSessionAuth(request) {
  const token = getBearerToken(request);
  if (!token) {
    const err = new Error("Session token required");
    err.status = 401;
    throw err;
  }
  try {
    return verifySessionToken(token);
  } catch {
    const err = new Error("Invalid session token");
    err.status = 401;
    throw err;
  }
}

function assertRole(decoded, roles) {
  if (!roles.includes(decoded.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
}

function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

module.exports = {
  getBearerToken,
  requireStaffAuth,
  requireSessionAuth,
  assertRole,
  jsonError,
};
