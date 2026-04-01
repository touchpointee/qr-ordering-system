"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const colorForStatus = {
  pending: "bg-white",
  printed: "bg-white",
  acknowledged: "bg-yellow-100",
  done: "bg-green-100",
};

export default function KitchenPage({ params }) {
  const [kots, setKots] = useState([]);
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://u133olebmptuq5bymoqwxnrr.103.108.220.202.sslip.io";

  async function load() {
    const res = await fetch(`/api/kots?kitchenId=${params.kitchenId}&status=pending,printed,acknowledged`);
    const data = await res.json();
    setKots(data.kots || []);
  }

  useEffect(() => {
    load();
    const socket = io(socketUrl, { reconnection: true, reconnectionAttempts: Infinity });
    socket.on("connect", () => {
      socket.emit("join_kitchen", { kitchenId: params.kitchenId });
      load();
    });
    socket.on("new_kot", (kot) => setKots((prev) => [kot, ...prev]));
    socket.on("kot_updated", (payload) => {
      setKots((prev) =>
        prev
          .map((k) => (k._id === payload.kotId ? { ...k, status: payload.status } : k))
          .filter((k) => k.status !== "done")
      );
    });
    return () => socket.disconnect();
  }, [params.kitchenId, socketUrl]);

  async function onCardClick(kot) {
    const endpoint = kot.status === "acknowledged" ? "done" : "acknowledge";
    await fetch(`/api/kots/${kot._id}/${endpoint}`, { method: "PATCH" });
    await load();
  }

  const sectionCounts = useMemo(() => {
    const map = {};
    for (const k of kots) {
      const key = k.sectionId?.toString() || "unknown";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [kots]);

  return (
    <main className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(sectionCounts).map(([sid, count]) => (
          <span key={sid} className="rounded bg-slate-800 px-2 py-1 text-xs text-white">
            {sid.slice(-4)}: {count}
          </span>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {kots.map((kot) => (
          <button key={kot._id} className={`rounded border p-3 text-left ${colorForStatus[kot.status] || "bg-white"}`} onClick={() => onCardClick(kot)}>
            <div className="font-semibold">Table {kot.tableName || kot.tableId?.slice(-4)}</div>
            <div className="text-sm text-slate-600">{kot.sectionName || kot.sectionId?.slice(-4)}</div>
            <div className="mt-2 space-y-1 text-sm">
              {(kot.items || []).map((it, i) => (
                <div key={i}>
                  {it.name} x{it.qty} {it.note ? `(${it.note})` : ""}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
