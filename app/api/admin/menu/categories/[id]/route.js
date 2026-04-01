const Category = require("../../../../../../models/Category");
const { makeUpdateDeleteHandlers } = require("../../../../../../lib/adminCrudFactory");

const handlers = makeUpdateDeleteHandlers(Category, ["name", "sortOrder"]);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
