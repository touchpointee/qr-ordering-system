const Subcategory = require("../../../../../../models/Subcategory");
const { makeUpdateDeleteHandlers } = require("../../../../../../lib/adminCrudFactory");

const handlers = makeUpdateDeleteHandlers(Subcategory, ["name", "sortOrder", "categoryId"]);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
