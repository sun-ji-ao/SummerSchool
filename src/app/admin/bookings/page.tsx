import Link from "next/link";
import { db } from "@/lib/db";
import { AdminStatusUpdateForm } from "@/app/admin/admin-status-update-form";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      course: true,
    },
  });
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Bookings</h1>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
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
    </main>
  );
}
