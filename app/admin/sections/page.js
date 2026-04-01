"use client";

import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [sections, setSections] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [form, setForm] = useState({ kitchenId: "", name: "", printerId: "" });

  const load = async () => {
    const [s, k, p] = await Promise.all([
      fetch("/api/admin/sections").then((r) => r.json()),
      fetch("/api/admin/kitchens").then((r) => r.json()),
      fetch("/api/admin/printers").then((r) => r.json()),
    ]);
    setSections(s.data || []);
    setKitchens(k.data || []);
    setPrinters(p.data || []);
  };
  useEffect(() => { load(); }, []);

  const kitchenMap = useMemo(() => Object.fromEntries(kitchens.map((k) => [k._id, k.name])), [kitchens]);
  const printerMap = useMemo(() => Object.fromEntries(printers.map((p) => [p._id, p.name])), [printers]);

  async function createSection() {
    await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm((p) => ({ ...p, name: "" }));
    load();
  }

  async function deleteSection(id) {
    await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="admin-card space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Sections (Kitchen to Printer Mapping)</h1>
      <div className="grid gap-2 md:grid-cols-3">
        <select className="admin-input" value={form.kitchenId} onChange={(e) => setForm((p) => ({ ...p, kitchenId: e.target.value }))}>
          <option value="">Select Kitchen</option>
          {kitchens.map((k) => <option key={k._id} value={k._id}>{k.name}</option>)}
        </select>
        <input className="admin-input" placeholder="Section Name (e.g. Grill)" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <select className="admin-input" value={form.printerId} onChange={(e) => setForm((p) => ({ ...p, printerId: e.target.value }))}>
          <option value="">Select Printer</option>
          {printers.map((pr) => <option key={pr._id} value={pr._id}>{pr.name}</option>)}
        </select>
      </div>
      <button className="admin-btn-primary" onClick={createSection}>Add Section Mapping</button>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div>{s.name} {"->"} Kitchen: {kitchenMap[s.kitchenId] || s.kitchenId} {"->"} Printer: {printerMap[s.printerId] || s.printerId}</div>
            <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deleteSection(s._id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
