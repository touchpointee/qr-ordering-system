"use client";

import { useEffect, useState } from "react";

export default function MenuCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", sortOrder: "1" });

  async function load() {
    const res = await fetch("/api/admin/menu/categories").then((r) => r.json());
    setCategories(res.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory() {
    await fetch("/api/admin/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder || 1) }),
    });
    setForm((p) => ({ ...p, name: "" }));
    load();
  }

  async function deleteCategory(id) {
    await fetch(`/api/admin/menu/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Menu Categories</h1>
      <section className="admin-card space-y-2">
        <h2 className="font-semibold">Create Category</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <input className="admin-input" placeholder="Category Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="admin-input" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        </div>
        <button className="admin-btn-primary" onClick={addCategory}>Add Category</button>
      </section>
      <section className="admin-card">
        <h2 className="font-semibold">Categories ({categories.length})</h2>
        <div className="mt-2 space-y-2 text-sm">
          {categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>{c.name} (sort: {c.sortOrder})</div>
              <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deleteCategory(c._id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
