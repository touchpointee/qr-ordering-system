"use client";

import { useEffect, useMemo, useState } from "react";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [itemForm, setItemForm] = useState({
    kitchenId: "",
    categoryId: "",
    subcategoryId: "",
    name: "",
    description: "",
    price: "",
    isVeg: "true",
    image: "",
  });
  const load = async () => {
    const [c, s, i, k] = await Promise.all([
      fetch("/api/admin/menu/categories").then((r) => r.json()),
      fetch("/api/admin/menu/subcategories").then((r) => r.json()),
      fetch("/api/admin/menu/items").then((r) => r.json()),
      fetch("/api/admin/kitchens").then((r) => r.json()),
    ]);
    setCategories(c.data || []);
    setSubcategories(s.data || []);
    setItems(i.data || []);
    setKitchens(k.data || []);
  };
  useEffect(() => { load(); }, []);
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c._id, c.name])), [categories]);
  const subcategoryMap = useMemo(() => Object.fromEntries(subcategories.map((s) => [s._id, s.name])), [subcategories]);
  const kitchenMap = useMemo(() => Object.fromEntries(kitchens.map((s) => [s._id, s.name])), [kitchens]);
  const groupedSubcategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        subcategories: subcategories.filter((subcategory) => subcategory.categoryId === category._id),
      })),
    [categories, subcategories]
  );

  async function addItem() {
    if (!itemForm.categoryId || !itemForm.subcategoryId) return;
    await fetch("/api/admin/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...itemForm,
        subcategoryId: itemForm.subcategoryId || undefined,
        price: Number(itemForm.price || 0),
        isVeg: itemForm.isVeg === "true",
        isAvailable: true,
      }),
    });
    setItemForm((p) => ({ ...p, subcategoryId: "", name: "", description: "", price: "", image: "" }));
    load();
  }

  async function toggleItem(id) {
    await fetch(`/api/admin/menu/items/${id}/toggle`, { method: "PATCH" });
    load();
  }

  async function updateItemKitchen(id, kitchenId) {
    await fetch(`/api/admin/menu/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kitchenId: kitchenId || null }),
    });
    load();
  }

  async function deleteItem(id) {
    await fetch(`/api/admin/menu/items/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Menu</h1>
      <section className="admin-card space-y-2">
        <h2 className="font-semibold">Manage Category Flow</h2>
        <div className="flex flex-wrap gap-2">
          <a className="admin-btn-primary" href="/admin/menu/categories">Open Categories Page</a>
          <a className="admin-btn-primary" href="/admin/menu/subcategories">Open Subcategories Page</a>
        </div>
      </section>
      <section className="admin-card space-y-2">
        <h2 className="font-semibold">Create Menu Item</h2>
        <p className="text-sm text-slate-600">Flow: Category {"->"} Subcategory {"->"} Item. Add categories and subcategories in the portal first, then attach each item under a real subcategory.</p>
        <div className="grid gap-2 md:grid-cols-4">
          <select className="admin-input" value={itemForm.kitchenId} onChange={(e) => setItemForm((p) => ({ ...p, kitchenId: e.target.value }))}>
            <option value="">Select Kitchen</option>
            {kitchens.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="admin-input" value={itemForm.categoryId} onChange={(e) => setItemForm((p) => ({ ...p, categoryId: e.target.value }))}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="admin-input" value={itemForm.subcategoryId} onChange={(e) => setItemForm((p) => ({ ...p, subcategoryId: e.target.value }))}>
            <option value="">Select Subcategory</option>
            {subcategories
              .filter((s) => !itemForm.categoryId || s.categoryId === itemForm.categoryId)
              .map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input className="admin-input" placeholder="Item Name" value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="admin-input" placeholder="Description" value={itemForm.description} onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))} />
          <input className="admin-input" placeholder="Price" value={itemForm.price} onChange={(e) => setItemForm((p) => ({ ...p, price: e.target.value }))} />
          <select className="admin-input" value={itemForm.isVeg} onChange={(e) => setItemForm((p) => ({ ...p, isVeg: e.target.value }))}>
            <option value="true">Veg</option>
            <option value="false">Non-Veg</option>
          </select>
          <input className="admin-input" placeholder="Image URL" value={itemForm.image} onChange={(e) => setItemForm((p) => ({ ...p, image: e.target.value }))} />
        </div>
        <button className="admin-btn-primary" disabled={!itemForm.categoryId || !itemForm.subcategoryId} onClick={addItem}>Add Item</button>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="admin-card">
          <h2 className="font-semibold">Category {"->"} Subcategory Map</h2>
          <div className="mt-2 space-y-3 text-sm">
            {groupedSubcategories.map((category) => (
              <div key={category._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-medium text-slate-900">{category.name}</div>
                <div className="mt-2 space-y-1 text-slate-600">
                  {category.subcategories.length > 0 ? category.subcategories.map((subcategory) => (
                    <div key={subcategory._id}>{subcategory.name}</div>
                  )) : <div>No subcategories yet</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-card">
          <h2 className="font-semibold">Items ({items.length})</h2>
          <div className="mt-2 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-medium">{i.name} - Rs {i.price}</div>
                <div className="text-xs text-slate-600">
                  Category: {categoryMap[i.categoryId] || i.categoryId}
                  {" | "}
                  Subcategory: {subcategoryMap[i.subcategoryId] || i.subcategoryId || "-"}
                  {" | "}
                  Kitchen: {kitchenMap[i.kitchenId] || i.kitchenId || "Not set"}
                </div>
                <div className="mt-2">
                  <select
                    className="admin-input text-xs"
                    value={i.kitchenId || ""}
                    onChange={(e) => updateItemKitchen(i._id, e.target.value)}
                  >
                    <option value="">Assign Kitchen</option>
                    {kitchens.map((kitchen) => (
                      <option key={kitchen._id} value={kitchen._id}>
                        {kitchen.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className={`rounded-xl px-3 py-1.5 text-xs text-white ${i.isAvailable ? "bg-amber-600" : "bg-emerald-600"}`} onClick={() => toggleItem(i._id)}>
                    {i.isAvailable ? "Mark Out of Stock" : "Mark In Stock"}
                  </button>
                  <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs text-white" onClick={() => deleteItem(i._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
