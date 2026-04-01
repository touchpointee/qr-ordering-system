const Printer = require("../../../../../../models/Printer");
const { printWithRetry } = require("../../../../../../lib/printer");
const { initDb } = require("../../../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../../../lib/crud");

export async function POST(request, { params }) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const printer = await Printer.findById(params.id);
    if (!printer) return Response.json({ error: "Printer not found" }, { status: 404 });
    const result = await printWithRetry(printer, {
      restaurantName: "Test Print",
      tableName: "N/A",
      sectionName: "N/A",
      kotLabel: "TEST JOB",
      items: [{ name: "Printer test successful", qty: 1, note: "" }],
    });
    return Response.json({ success: result.ok, error: result.error || null });
  } catch (error) {
    return handleRouteError(error, "Test print failed");
  }
}
