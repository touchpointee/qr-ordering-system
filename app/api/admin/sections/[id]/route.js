const Section = require("../../../../../models/Section");
const { makeUpdateDeleteHandlers } = require("../../../../../lib/adminCrudFactory");

const handlers = makeUpdateDeleteHandlers(Section, ["name", "printerId", "kitchenId"]);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
