"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", port: "9100", type: "usb" });
  const [discovered, setDiscovered] = useState([]);
  const [discovering, setDiscovering] = useState(false);
  const load = () => fetch("/api/admin/printers").then((r) => r.json()).then((j) => setRows(j.data || []));
  useEffect(() => { load(); }, []);

  async function createPrinter() {
    await fetch("/api/admin/printers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ipAddress: "", port: Number(form.port || 9100) }),
    });
    setForm((p) => ({ ...p, name: "" }));
    load();
  }

  async function discoverPrinters() {
    setDiscovering(true);
    const res = await fetch("/api/admin/printers?action=connected", { method: "PATCH" });
    const json = await res.json();
    setDiscovered(json.discovered || []);
    setDiscovering(false);
  }

  async function saveDiscovered(printer, idx) {
    const name = printer.name?.trim();
    if (!name) return;
    await fetch("/api/admin/printers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ipAddress: printer.ipAddress,
        port: printer.port || 9100,
        type: "network",
      }),
    });
    setDiscovered((prev) => prev.filter((_, i) => i !== idx));
    load();
  }

  async function deletePrinter(id) {
    await fetch(`/api/admin/printers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="admin-card space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Printers</h1>
      <div className="flex flex-wrap gap-2">
        <button className="admin-btn-muted" onClick={discoverPrinters} disabled={discovering}>
          {discovering ? "Collecting..." : "Collect Connected Printers"}
        </button>
      </div>
      {discovered.length > 0 && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h2 className="font-medium text-slate-900">Discovered printers</h2>
          {discovered.map((d, idx) => (
            <div key={`${d.ipAddress}-${idx}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input className="admin-input" value={d.name || d.ipAddress || d.portName || "Unknown printer"} readOnly />
              <input
                className="admin-input"
                placeholder="Set printer name"
                value={d.name || ""}
                onChange={(e) =>
                  setDiscovered((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x))
                  )
                }
              />
              <button className="admin-btn-primary" onClick={() => saveDiscovered(d, idx)}>Save</button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-3">
        <input className="admin-input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="admin-input" placeholder="Port" value={form.port} onChange={(e) => setForm((p) => ({ ...p, port: e.target.value }))} />
        <select className="admin-input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
          <option value="usb">usb</option>
          <option value="network">network</option>
        </select>
      </div>
      <button className="admin-btn-primary" onClick={createPrinter}>Add Printer Manually</button>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div>{p.name} - {p.type}{p.port ? ` (port ${p.port})` : ""}</div>
            <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deletePrinter(p._id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
