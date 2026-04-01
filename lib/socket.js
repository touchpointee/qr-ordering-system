const { Server } = require("socket.io");
const { verifyStaffToken } = require("./auth");

let ioRef = null;

function initSocketIO(httpServer) {
  const origin =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.CORS_ORIGIN ||
    "*";

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioRef = io;
  globalThis.__socketIO = io;

  io.on("connection", (socket) => {
    socket.on("join_kitchen", (payload) => {
      const kitchenId = payload?.kitchenId;
      if (kitchenId) socket.join(`kitchen_${kitchenId}`);
    });

    socket.on("join_table", (payload) => {
      const tableId = payload?.tableId;
      if (tableId) socket.join(`table_${tableId}`);
    });

    socket.on("join_staff", async (payload) => {
      const token = payload?.token || socket.handshake.auth?.token;
      if (!token) {
        socket.emit("staff_error", { error: "Missing token" });
        return;
      }
      try {
        verifyStaffToken(token);
        socket.join("staff_general");
        socket.emit("staff_joined", { ok: true });
      } catch {
        socket.emit("staff_error", { error: "Invalid token" });
      }
    });
  });

  return io;
}

function getIO() {
  if (ioRef) return ioRef;
  if (typeof globalThis.__socketIO !== "undefined") return globalThis.__socketIO;
  return null;
}

module.exports = { initSocketIO, getIO };
