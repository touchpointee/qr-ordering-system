"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  async function load(currentStatus = status) {
    const q = currentStatus ? `?status=${currentStatus}` : "";
    const j = await fetch(`/api/orders${q}`).then((r) => r.json());
    setOrders(j.orders || []);
  }
  useEffect(() => { load(""); }, []);

  async function updateStatus(id, nextStatus) {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  }
  return (
    <main className="admin-card space-y-3">
      <h1 className="mb-3 text-xl font-semibold text-slate-900">Orders</h1>
      <div className="flex gap-2">
        <select className="admin-input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="preparing">preparing</option>
          <option value="ready">ready</option>
          <option value="billed">billed</option>
          <option value="cancelled">cancelled</option>
        </select>
        <button className="admin-btn-primary" onClick={() => load(status)}>Apply</button>
      </div>
      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="font-semibold">Order: {o._id}</div>
            <div>Table: {o.tableId?.toString()}</div>
            <div className="flex items-center gap-2">
              <span>Status: {o.status}</span>
              <select className="admin-input h-8 py-0 text-xs" defaultValue={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                <option value="pending">pending</option>
                <option value="preparing">preparing</option>
                <option value="ready">ready</option>
                <option value="billed">billed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>Total: Rs {o.totalAmount}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
