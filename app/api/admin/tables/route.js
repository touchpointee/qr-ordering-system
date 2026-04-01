const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Table = require("../../../../models/Table");
const { makeListCreateHandlers } = require("../../../../lib/adminCrudFactory");
const { requireStaffAuth } = require("../../../../lib/requestAuth");
const { initDb } = require("../../../../lib/bootstrap");
const { handleRouteError } = require("../../../../lib/crud");
const { requireAdminRestaurantId } = require("../../../../lib/adminRestaurant");

const handlers = makeListCreateHandlers(Table, [
  "restaurantId",
  "name",
  "qrToken",
  "isActive",
  "billRequested",
]);

export async function GET(request) {
  try {
    const decoded = requireStaffAuth(request);
    await initDb();
    const restaurantId = requireAdminRestaurantId(decoded);
    const query = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };
    const rows = await Table.find(query).sort({ createdAt: -1 }).lean();
    return Response.json({ data: rows });
  } catch (error) {
    return handleRouteError(error, "List failed");
  }
}

export async function POST(request) {
  const origJson = request.json.bind(request);
  request.json = async () => {
    const decoded = requireStaffAuth(request);
    const body = await origJson();
    body.restaurantId = requireAdminRestaurantId(decoded);
    if (!body.qrToken) body.qrToken = uuidv4();
    return body;
  };
  return handlers.POST(request);
}
