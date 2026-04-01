const net = require("net");

const ESC = "\x1B";
const GS = "\x1D";

function encodeText(s) {
  return Buffer.from(s, "utf8");
}

function alignCenter() {
  return Buffer.from(`${ESC}a\x01`, "binary");
}

function alignLeft() {
  return Buffer.from(`${ESC}a\x00`, "binary");
}

function boldOn() {
  return Buffer.from(`${ESC}E\x01`, "binary");
}

function boldOff() {
  return Buffer.from(`${ESC}E\x00`, "binary");
}

function feedLines(n) {
  return Buffer.from(`${ESC}d${String.fromCharCode(n)}`, "binary");
}

function cutPaper() {
  return Buffer.from(`${GS}V\x00`, "binary");
}

function initPrinter() {
  return Buffer.from(`${ESC}@`, "binary");
}

function dividerLine(width = 32) {
  return encodeText("-".repeat(Math.min(width, 48)) + "\n");
}

function buildKotBuffer({
  restaurantName,
  tableName,
  sectionName,
  kotLabel,
  items,
}) {
  const chunks = [];
  chunks.push(initPrinter());
  chunks.push(alignCenter());
  chunks.push(boldOn());
  chunks.push(encodeText(`${restaurantName}\n`));
  chunks.push(boldOff());
  chunks.push(feedLines(1));
  chunks.push(alignLeft());
  chunks.push(encodeText(`Table: ${tableName}\n`));
  chunks.push(encodeText(`Section: ${sectionName}\n`));
  const now = new Date();
  chunks.push(
    encodeText(
      `Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n`
    )
  );
  chunks.push(encodeText(`${kotLabel}\n`));
  chunks.push(dividerLine());
  for (const line of items) {
    const note = line.note ? ` (${line.note})` : "";
    chunks.push(encodeText(`${line.name} x${line.qty}${note}\n`));
  }
  chunks.push(dividerLine());
  chunks.push(feedLines(2));
  chunks.push(cutPaper());
  return Buffer.concat(chunks);
}

function sendToPrinter(host, port, buffer) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("Printer connection timeout"));
    }, 8000);

    socket.once("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    socket.connect(port, host, () => {
      socket.write(buffer, () => {
        clearTimeout(timeout);
        socket.end();
        resolve();
      });
    });
  });
}

async function printKotSlip(printer, payload) {
  const port = printer.port || 9100;
  const buffer = buildKotBuffer(payload);
  await sendToPrinter(printer.ipAddress, port, buffer);
}

async function printWithRetry(printer, payload) {
  try {
    await printKotSlip(printer, payload);
    return { ok: true };
  } catch (err) {
    console.error("Printer print failed, retrying once:", err.message);
    try {
      await printKotSlip(printer, payload);
      return { ok: true };
    } catch (err2) {
      console.error("Printer print failed after retry:", err2.message);
      return { ok: false, error: err2.message };
    }
  }
}

module.exports = {
  buildKotBuffer,
  printKotSlip,
  printWithRetry,
};
