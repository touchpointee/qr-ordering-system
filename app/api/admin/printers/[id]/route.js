const Printer = require("../../../../../models/Printer");
const { makeUpdateDeleteHandlers } = require("../../../../../lib/adminCrudFactory");

const handlers = makeUpdateDeleteHandlers(Printer, ["name", "ipAddress", "port", "type"]);

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
