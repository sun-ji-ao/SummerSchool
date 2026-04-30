import Link from "next/link";
import { BookingStatus, BookingType } from "@prisma/client";
import { db } from "@/lib/db";
import { AdminStatusUpdateForm } from "@/app/admin/admin-status-update-form";

export const dynamic = "force-dynamic";

type AdminBookingsPageProps = {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>;
};

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const params = await searchParams;
  const pageSize = 20;
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim();
  const status = params.status?.trim() as BookingStatus | undefined;
  const type = params.type?.trim() as BookingType | undefined;

  const where = {
    ...(q
      ? {
          OR: [
            { userEmail: { contains: q, mode: "insensitive" as const } },
            { userName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        course: true,
      },
    }),
    db.booking.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const queryBase = `q=${encodeURIComponent(q ?? "")}&status=${encodeURIComponent(status ?? "")}&type=${encodeURIComponent(type ?? "")}`;
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Bookings</h1>
        <div className="flex items-center gap-4">
          <Link
            href={`/api/admin/export/bookings?${queryBase}`}
            className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
          >
            Export CSV
          </Link>
          <Link href="/admin" className="text-sm text-blue-700 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          type="text"
          name="q"
          placeholder="Search by email/name"
          defaultValue={q ?? ""}
        />
        <select className="rounded border border-slate-300 px-3 py-2 text-sm" name="status" defaultValue={status ?? ""}>
          <option value="">All status</option>
          {["DRAFT", "SUBMITTED", "AWAITING_DEPOSIT", "DEPOSIT_PAID", "CONFIRMED", "CANCELLED"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="rounded border border-slate-300 px-3 py-2 text-sm" name="type" defaultValue={type ?? ""}>
          <option value="">All types</option>
          <option value="SUMMER">SUMMER</option>
          <option value="ONLINE_TUTORING">ONLINE_TUTORING</option>
        </select>
        <input type="hidden" name="page" value="1" />
        <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white" type="submit">
          Apply filters
        </button>
      </form>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Course</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Payment</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-slate-100">
                <td className="px-3 py-2">#{booking.id}</td>
                <td className="px-3 py-2">{booking.userEmail}</td>
                <td className="px-3 py-2">{booking.type}</td>
                <td className="px-3 py-2">{booking.course?.title ?? "N/A"}</td>
                <td className="px-3 py-2">
                  <AdminStatusUpdateForm
                    id={booking.id}
                    entity="booking"
                    value={booking.status}
                    options={["DRAFT", "SUBMITTED", "AWAITING_DEPOSIT", "DEPOSIT_PAID", "CONFIRMED", "CANCELLED"]}
                  />
                </td>
                <td className="px-3 py-2">{booking.payments[0]?.status ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <p>
          Page {currentPage} / {totalPages} · Total {total}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/admin/bookings?${queryBase}&page=${prevPage}`}
            className={`underline ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            Prev
          </Link>
          <Link
            href={`/admin/bookings?${queryBase}&page=${nextPage}`}
            className={`underline ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
