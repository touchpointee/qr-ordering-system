"use client";

import { useEffect, useMemo, useState } from "react";

export default function MenuSubcategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({ categoryId: "", name: "", sortOrder: "1" });

  async function load() {
    const [cats, subs] = await Promise.all([
      fetch("/api/admin/menu/categories").then((r) => r.json()),
      fetch("/api/admin/menu/subcategories").then((r) => r.json()),
    ]);
    setCategories(cats.data || []);
    setSubcategories(subs.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c._id, c.name])), [categories]);

  async function addSubcategory() {
    await fetch("/api/admin/menu/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder || 1) }),
    });
    setForm((p) => ({ ...p, name: "" }));
    load();
  }

  async function deleteSubcategory(id) {
    await fetch(`/api/admin/menu/subcategories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Category Subcategories</h1>
      <section className="admin-card space-y-2">
        <h2 className="font-semibold">Create Subcategory Under Category</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <select className="admin-input" value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input className="admin-input" placeholder="Subcategory Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="admin-input" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        </div>
        <button className="admin-btn-primary" onClick={addSubcategory}>Add Subcategory</button>
      </section>
      <section className="admin-card">
        <h2 className="font-semibold">Subcategories ({subcategories.length})</h2>
        <div className="mt-2 space-y-2 text-sm">
          {subcategories.map((s) => (
            <div key={s._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>{categoryMap[s.categoryId] || s.categoryId} {"->"} {s.name} (sort: {s.sortOrder})</div>
              <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deleteSubcategory(s._id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
