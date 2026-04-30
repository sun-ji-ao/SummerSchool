import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <div className="mt-4 flex gap-4">
        <Link href="/admin/login" className="rounded bg-slate-900 px-4 py-2 text-white">
          Login
        </Link>
      </div>
    </main>
  );
}
