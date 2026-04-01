import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Food Book</h1>
        <p className="text-sm text-slate-600">
          Manage your restaurant and open customer ordering through table QR links.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded bg-slate-900 px-3 py-2 text-white" href="/admin/dashboard">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
