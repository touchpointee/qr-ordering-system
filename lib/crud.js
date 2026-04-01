const mongoose = require("mongoose");
const { z } = require("zod");
const { jsonError } = require("./requestAuth");

function objectIdSchema(name = "id") {
  return z
    .string()
    .refine((v) => mongoose.Types.ObjectId.isValid(v), `${name} is invalid`);
}

async function parseJson(request, schema) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const err = new Error(parsed.error.issues[0]?.message || "Validation failed");
    err.status = 400;
    throw err;
  }
  return parsed.data;
}

function handleRouteError(error, fallback = "Request failed") {
  return jsonError(error.message || fallback, error.status || 500);
}

module.exports = {
  z,
  objectIdSchema,
  parseJson,
  handleRouteError,
};
