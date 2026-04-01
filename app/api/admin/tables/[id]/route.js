const Table = require("../../../../../models/Table");
const { initDb } = require("../../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../../lib/crud");

const STAFF_TABLE_UPDATE_FIELDS = ["billRequested", "currentSessionId"];
const ADMIN_TABLE_UPDATE_FIELDS = ["name", "isActive", "billRequested", "currentSessionId"];

export async function PATCH(request, { params }) {
  try {
    const decoded = requireStaffAuth(request);
    await initDb();

    const body = await request.json();
    const isFloorAction =
      Object.keys(body).length > 0 &&
      Object.keys(body).every((key) => STAFF_TABLE_UPDATE_FIELDS.includes(key));

    if (isFloorAction) {
      assertRole(decoded, ["superadmin", "kitchen_manager", "waiter", "cashier"]);
    } else {
      assertRole(decoded, ["superadmin", "kitchen_manager"]);
    }

    const allowedFields = isFloorAction ? STAFF_TABLE_UPDATE_FIELDS : ADMIN_TABLE_UPDATE_FIELDS;
    const update = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const row = await Table.findByIdAndUpdate(params.id, { $set: update }, { new: true });
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ data: row });
  } catch (error) {
    return handleRouteError(error, "Update failed");
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const row = await Table.findByIdAndDelete(params.id);
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "Delete failed");
  }
}
