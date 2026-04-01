"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [tables, setTables] = useState([]);
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((j) => setOrders(j.orders || []));
    fetch("/api/admin/kitchens").then((r) => r.json()).then((j) => setKitchens(j.data || []));
    fetch("/api/admin/tables").then((r) => r.json()).then((j) => setTables(j.data || []));
    fetch("/api/admin/menu/items").then((r) => r.json()).then((j) => setItems(j.data || []));
  }, []);

  const active = orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length;
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="admin-card p-4"><div className="text-sm text-slate-500">Total Orders</div><div className="text-2xl font-bold text-slate-900">{orders.length}</div></div>
        <div className="admin-card p-4"><div className="text-sm text-slate-500">Active Orders</div><div className="text-2xl font-bold text-slate-900">{active}</div></div>
        <div className="admin-card p-4"><div className="text-sm text-slate-500">Kitchens</div><div className="text-2xl font-bold text-slate-900">{kitchens.length}</div></div>
        <div className="admin-card p-4"><div className="text-sm text-slate-500">Tables</div><div className="text-2xl font-bold text-slate-900">{tables.length}</div></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-2 font-semibold">Quick Setup</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link className="admin-btn-primary" href="/admin/kitchens">Add Kitchen</Link>
            <Link className="admin-btn-primary" href="/admin/printers">Add Printer</Link>
            <Link className="admin-btn-primary" href="/admin/menu">Add Menu</Link>
            <Link className="admin-btn-primary" href="/admin/tables">Create Tables + QR</Link>
          </div>
        </div>
        <div className="admin-card">
          <h2 className="mb-2 font-semibold">Menu Snapshot</h2>
          <p className="text-sm text-slate-600">Total active menu items: {items.filter((i) => i.isAvailable).length}</p>
          <p className="text-sm text-slate-600">Disabled items: {items.filter((i) => !i.isAvailable).length}</p>
        </div>
      </div>
    </main>
  );
}
