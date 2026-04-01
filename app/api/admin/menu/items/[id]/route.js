const MenuItem = require("../../../../../../models/MenuItem");
const { makeUpdateDeleteHandlers } = require("../../../../../../lib/adminCrudFactory");

const handlers = makeUpdateDeleteHandlers(MenuItem, [
  "name",
  "description",
  "price",
  "isAvailable",
  "isVeg",
  "image",
  "categoryId",
  "subcategoryId",
  "kitchenId",
  "sectionId",
]);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
