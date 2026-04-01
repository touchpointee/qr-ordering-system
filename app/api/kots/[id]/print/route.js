const KOT = require("../../../../../models/KOT");
const Table = require("../../../../../models/Table");
const Kitchen = require("../../../../../models/Kitchen");
const Restaurant = require("../../../../../models/Restaurant");
const Printer = require("../../../../../models/Printer");
const { initDb } = require("../../../../../lib/bootstrap");
const { handleRouteError, objectIdSchema } = require("../../../../../lib/crud");
const { printWithRetry } = require("../../../../../lib/printer");

export async function POST(_request, { params }) {
  try {
    objectIdSchema("id").parse(params.id);
    await initDb();
    const kot = await KOT.findById(params.id);
    if (!kot) return Response.json({ error: "KOT not found" }, { status: 404 });
    const [table, kitchen, restaurant, printer] = await Promise.all([
      Table.findById(kot.tableId),
      Kitchen.findById(kot.kitchenId),
      Restaurant.findById(kot.restaurantId),
      Printer.findById(kot.printerId),
    ]);
    const result = await printWithRetry(printer, {
      restaurantName: restaurant.name,
      tableName: table.name,
      sectionName: kitchen?.name || "Kitchen",
      kotLabel: `KOT #${kot._id.toString().slice(-6).toUpperCase()}`,
      items: kot.items,
    });
    if (result.ok) {
      kot.printCount += 1;
      kot.status = "printed";
      await kot.save();
    }
    return Response.json({ success: result.ok, error: result.error || null, kot });
  } catch (error) {
    return handleRouteError(error, "KOT reprint failed");
  }
}
