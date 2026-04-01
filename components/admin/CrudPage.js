"use client";

import { useEffect, useState } from "react";

export default function CrudPage({ title, apiPath, fields }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(apiPath);
    const json = await res.json();
    setRows(json.data || json.orders || []);
  }

  useEffect(() => {
    load();
  }, [apiPath]);

  async function createRow() {
    setError("");
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Create failed");
      return;
    }
    setForm({});
    await load();
  }

  async function deleteRow(id) {
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  return (
    <main className="space-y-4 rounded bg-white p-4 shadow">
      <h1 className="text-xl font-semibold">{title}</h1>
      {error ? <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-2 md:grid-cols-3">
        {fields.map((f) => (
          <input
            key={f.name}
            className="rounded border px-3 py-2 text-sm"
            placeholder={f.label}
            value={form[f.name] || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
          />
        ))}
      </div>
      <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={createRow}>
        Create
      </button>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r._id || r.id} className="flex items-center justify-between rounded border p-2 text-sm">
            <pre className="overflow-x-auto">{JSON.stringify(r, null, 2)}</pre>
            <button className="rounded bg-red-600 px-2 py-1 text-xs text-white" onClick={() => deleteRow(r._id || r.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
