const QRCode = require("qrcode");
const Table = require("../../../../../../models/Table");
const { initDb } = require("../../../../../../lib/bootstrap");
const { requireStaffAuth } = require("../../../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../../../lib/crud");

export async function GET(request, { params }) {
  try {
    requireStaffAuth(request);
    await initDb();
    const table = await Table.findById(params.id).lean();
    if (!table) return Response.json({ error: "Table not found" }, { status: 404 });
    const orderUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://u133olebmptuq5bymoqwxnrr.103.108.220.202.sslip.io"}/order/${table.qrToken}`;
    const png = await QRCode.toBuffer(orderUrl, { type: "png", width: 512, margin: 2 });
    return new Response(png, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename=\"table-${table.name}-qr.png\"`,
      },
    });
  } catch (error) {
    return handleRouteError(error, "QR generation failed");
  }
}
