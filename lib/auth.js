const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_JWT_SECRET = process.env.SESSION_JWT_SECRET;

const SESSION_EXPIRY_SEC = 4 * 60 * 60;

function requireEnv() {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  if (!SESSION_JWT_SECRET) throw new Error("SESSION_JWT_SECRET is not set");
}

function signStaffToken(user) {
  requireEnv();
  return jwt.sign(
    {
      sub: user._id.toString(),
      restaurantId: user.restaurantId.toString(),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyStaffToken(token) {
  requireEnv();
  return jwt.verify(token, JWT_SECRET);
}

function signSessionToken(payload) {
  requireEnv();
  return jwt.sign(
    {
      typ: "session",
      sessionId: payload.sessionId,
      tableId: payload.tableId,
      restaurantId: payload.restaurantId,
    },
    SESSION_JWT_SECRET,
    { expiresIn: SESSION_EXPIRY_SEC }
  );
}

function verifySessionToken(token) {
  requireEnv();
  const decoded = jwt.verify(token, SESSION_JWT_SECRET);
  if (decoded.typ !== "session") {
    const err = new Error("Invalid session token");
    err.statusCode = 401;
    throw err;
  }
  return decoded;
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = {
  signStaffToken,
  verifyStaffToken,
  signSessionToken,
  verifySessionToken,
  hashPassword,
  comparePassword,
  SESSION_EXPIRY_SEC,
};
