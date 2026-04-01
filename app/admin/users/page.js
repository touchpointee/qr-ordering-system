"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter",
  });

  const load = async () => {
    setError("");
    const response = await fetch("/api/admin/users", { credentials: "include" });
    const u = await response.json();
    if (!response.ok) {
      setError(u.error || "Failed to load users");
      return;
    }
    setRows(u.data || []);
  };
  useEffect(() => { load(); }, []);

  async function createUser() {
    setError("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Failed to create user");
      return;
    }
    setForm((p) => ({ ...p, name: "", email: "", password: "" }));
    load();
  }

  async function removeUser(id) {
    setError("");
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Failed to delete user");
      return;
    }
    load();
  }

  return (
    <main className="admin-card space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Users</h1>
      <div className="grid gap-2 md:grid-cols-3">
        <input className="admin-input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="admin-input" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="admin-input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <select className="admin-input" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
          <option value="superadmin">superadmin</option>
          <option value="kitchen_manager">kitchen_manager</option>
          <option value="waiter">waiter</option>
          <option value="cashier">cashier</option>
        </select>
      </div>
      <button className="admin-btn-primary" onClick={createUser}>Create User</button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-2">
        {rows.map((u) => (
          <div key={u._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div>{u.name} ({u.role}) - {u.email}</div>
            <button className="rounded-xl bg-rose-500 px-3 py-1.5 text-white" onClick={() => removeUser(u._id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
