const { initDb } = require("./bootstrap");
const { requireStaffAuth, assertRole } = require("./requestAuth");
const { handleRouteError } = require("./crud");

function makeListCreateHandlers(Model, allowedCreateFields) {
  return {
    GET: async (request) => {
      try {
        requireStaffAuth(request);
        await initDb();
        const rows = await Model.find({}).sort({ createdAt: -1 }).lean();
        return Response.json({ data: rows });
      } catch (error) {
        return handleRouteError(error, "List failed");
      }
    },
    POST: async (request) => {
      try {
        const decoded = requireStaffAuth(request);
        assertRole(decoded, ["superadmin", "kitchen_manager"]);
        await initDb();
        const body = await request.json();
        const payload = {};
        for (const key of allowedCreateFields) {
          if (body[key] !== undefined) payload[key] = body[key];
        }
        const created = await Model.create(payload);
        return Response.json({ data: created });
      } catch (error) {
        return handleRouteError(error, "Create failed");
      }
    },
  };
}

function makeUpdateDeleteHandlers(Model, allowedFields) {
  return {
    PATCH: async (request, { params }) => {
      try {
        const decoded = requireStaffAuth(request);
        assertRole(decoded, ["superadmin", "kitchen_manager"]);
        await initDb();
        const body = await request.json();
        const update = {};
        for (const key of allowedFields) {
          if (body[key] !== undefined) update[key] = body[key];
        }
        const row = await Model.findByIdAndUpdate(params.id, { $set: update }, { new: true });
        if (!row) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json({ data: row });
      } catch (error) {
        return handleRouteError(error, "Update failed");
      }
    },
    DELETE: async (request, { params }) => {
      try {
        const decoded = requireStaffAuth(request);
        assertRole(decoded, ["superadmin", "kitchen_manager"]);
        await initDb();
        const row = await Model.findByIdAndDelete(params.id);
        if (!row) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json({ success: true });
      } catch (error) {
        return handleRouteError(error, "Delete failed");
      }
    },
  };
}

module.exports = { makeListCreateHandlers, makeUpdateDeleteHandlers };
