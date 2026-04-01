"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [printerId, setPrinterId] = useState("");

  const load = async () => {
    const [k, p] = await Promise.all([
      fetch("/api/admin/kitchens").then((r) => r.json()),
      fetch("/api/admin/printers").then((r) => r.json()),
    ]);
    setRows(k.data || []);
    setPrinters(p.data || []);
  };
  useEffect(() => { load(); }, []);

  async function createKitchen() {
    await fetch("/api/admin/kitchens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, printerId: printerId || null }),
    });
    setName("");
    setDescription("");
    setPrinterId("");
    load();
  }

  async function deleteKitchen(id) {
    await fetch(`/api/admin/kitchens/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="admin-card space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Kitchens (Map printer to kitchen)</h1>
      <div className="grid gap-2 md:grid-cols-3">
        <input className="admin-input" placeholder="Kitchen name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="admin-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select className="admin-input" value={printerId} onChange={(e) => setPrinterId(e.target.value)}>
          <option value="">Select Printer</option>
          {printers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>
      <button className="admin-btn-primary" onClick={createKitchen}>Add Kitchen</button>
      <div className="space-y-2">
        {rows.map((k) => {
          const mappedPrinter = printers.find((p) => String(p._id) === String(k.printerId));
          return (
            <div key={k._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div>{k.name} - {k.description} | Printer: {mappedPrinter?.name || "Not mapped"}</div>
              <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deleteKitchen(k._id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
