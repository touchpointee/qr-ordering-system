const Printer = require("../../../../models/Printer");
const { initDb } = require("../../../../lib/bootstrap");
const { requireStaffAuth, assertRole } = require("../../../../lib/requestAuth");
const { handleRouteError } = require("../../../../lib/crud");
const { requireAdminRestaurantId } = require("../../../../lib/adminRestaurant");
const net = require("net");
const os = require("os");
const { exec } = require("child_process");

function timeoutConnect(host, port = 9100, timeoutMs = 350) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      try {
        socket.destroy();
      } catch {}
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

export async function GET(request) {
  try {
    const decoded = requireStaffAuth(request);
    await initDb();
    const query = { restaurantId: requireAdminRestaurantId(decoded) };
    const rows = await Printer.find(query).sort({ createdAt: -1 }).lean();
    return Response.json({ data: rows });
  } catch (error) {
    return handleRouteError(error, "List failed");
  }
}

export async function POST(request) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    await initDb();
    const body = await request.json();
    const created = await Printer.create({
      restaurantId: requireAdminRestaurantId(decoded),
      name: body.name,
      ipAddress: body.ipAddress || "",
      port: Number(body.port || 9100),
      type: body.type || "usb",
    });
    return Response.json({ data: created });
  } catch (error) {
    return handleRouteError(error, "Create failed");
  }
}

export async function PATCH(request) {
  try {
    const decoded = requireStaffAuth(request);
    assertRole(decoded, ["superadmin", "kitchen_manager"]);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    if (!action) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "connected") {
      const ps = 'Get-Printer | Select-Object Name,PortName,DriverName,PrinterStatus | ConvertTo-Json -Depth 2';
      const printers = await new Promise((resolve, reject) => {
        exec(`powershell -NoProfile -Command "${ps}"`, { timeout: 10000 }, (err, stdout) => {
          if (err) return reject(err);
          try {
            const parsed = JSON.parse(stdout || "[]");
            const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
            resolve(
              list.map((p) => {
                const port = String(p.PortName || "");
                const ipLike = /(\d{1,3}\.){3}\d{1,3}/.test(port);
                return {
                  name: p.Name || "",
                  portName: port,
                  driverName: p.DriverName || "",
                  printerStatus: p.PrinterStatus,
                  type: ipLike ? "network" : "usb",
                  ipAddress: ipLike ? port.match(/(\d{1,3}\.){3}\d{1,3}/)[0] : "",
                };
              })
            );
          } catch {
            resolve([]);
          }
        });
      });
      return Response.json({ discovered: printers });
    }

    if (action !== "discover") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const nics = os.networkInterfaces();
    const candidates = new Set();
    Object.values(nics).forEach((arr) => {
      (arr || []).forEach((iface) => {
        if (!iface.internal && iface.family === "IPv4") {
          const parts = iface.address.split(".");
          if (parts.length === 4) {
            const base = `${parts[0]}.${parts[1]}.${parts[2]}`;
            for (let i = 1; i <= 30; i += 1) candidates.add(`${base}.${i}`);
          }
        }
      });
    });

    const scanList = Array.from(candidates).slice(0, 120);
    const results = [];
    for (const ip of scanList) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await timeoutConnect(ip, 9100);
      if (ok) results.push({ ipAddress: ip, port: 9100, type: "network" });
    }
    return Response.json({ discovered: results });
  } catch (error) {
    return handleRouteError(error, "Discover failed");
  }
}
