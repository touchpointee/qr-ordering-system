"use client";

import { useEffect, useState } from "react";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [name, setName] = useState("");
  useEffect(() => { fetch("/api/admin/tables").then((r) => r.json()).then((j) => setTables(j.data || [])); }, []);

  async function addTable() {
    await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, isActive: true }),
    });
    setName("");
    const r = await fetch("/api/admin/tables");
    const j = await r.json();
    setTables(j.data || []);
  }

  async function deleteTable(id) {
    await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    const r = await fetch("/api/admin/tables");
    const j = await r.json();
    setTables(j.data || []);
  }

  return (
    <main className="admin-card space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Tables</h1>
      <div className="grid gap-2 md:grid-cols-2">
        <input className="admin-input" placeholder="Table name (e.g. T11)" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="admin-btn-primary" onClick={addTable}>Add Table</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((t) => (
          <div key={t._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-slate-600">QR Token: {t.qrToken}</div>
            <div className="text-slate-600 break-all">Customer URL: /order/{t.qrToken}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <a className="inline-block rounded-xl bg-[#1d4ed8] px-3 py-1.5 text-xs text-white" href={`/api/admin/tables/${t._id}/qr`} target="_blank">Download QR PNG</a>
              <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deleteTable(t._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
