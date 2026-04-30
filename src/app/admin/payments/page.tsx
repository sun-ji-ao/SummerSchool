import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      booking: true,
    },
  });
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Payments</h1>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">Payment ID</th>
              <th className="px-3 py-2">Booking ID</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Currency</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Session ID</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-slate-100">
                <td className="px-3 py-2">#{payment.id}</td>
                <td className="px-3 py-2">#{payment.bookingId}</td>
                <td className="px-3 py-2">{payment.amount}</td>
                <td className="px-3 py-2">{payment.currency}</td>
                <td className="px-3 py-2">{payment.status}</td>
                <td className="px-3 py-2">{payment.stripeSessionId ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
