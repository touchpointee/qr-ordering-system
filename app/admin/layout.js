"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/kitchens", "Kitchens"],
  ["/admin/printers", "Printers"],
  ["/admin/tables", "Tables"],
  ["/admin/menu", "Menu"],
  ["/admin/menu/categories", "Menu Categories"],
  ["/admin/menu/subcategories", "Menu Subcategories"],
  ["/admin/users", "Users"],
  ["/admin/orders", "Orders"],
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="admin-shell">
      <div className="grid min-h-screen gap-0 md:grid-cols-[280px_1fr]">
        <aside className="admin-sidebar sticky top-0 h-screen rounded-none border-y-0 border-l-0 flex flex-col">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Food Book Admin</h2>
            <p className="mt-1 text-xs text-slate-500">Restaurant operations panel</p>
          </div>
          <nav className="space-y-1">
            {links.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[#e8efff] font-medium text-[#1d4ed8]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-slate-100 pt-4">
            <button className="admin-btn-muted w-full" onClick={logout}>
              Logout
            </button>
          </div>
        </aside>
        <section className="space-y-4 p-4">
          <div className="admin-card flex items-center justify-between py-4">
            <h1 className="text-lg font-semibold text-slate-900">Food Book Control Center</h1>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Live</span>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
