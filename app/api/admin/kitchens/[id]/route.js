const Kitchen = require("../../../../../models/Kitchen");
const { makeUpdateDeleteHandlers } = require("../../../../../lib/adminCrudFactory");

const handlers = makeUpdateDeleteHandlers(Kitchen, [
  "name",
  "description",
  "printerId",
]);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
