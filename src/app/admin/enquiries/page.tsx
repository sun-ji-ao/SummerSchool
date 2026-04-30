import Link from "next/link";
import { db } from "@/lib/db";
import { AdminStatusUpdateForm } from "@/app/admin/admin-status-update-form";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await db.bookingEnquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Enquiries</h1>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Parent</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Student Age</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="border-b border-slate-100">
                <td className="px-3 py-2">#{enquiry.id}</td>
                <td className="px-3 py-2">{enquiry.parentName}</td>
                <td className="px-3 py-2">{enquiry.email}</td>
                <td className="px-3 py-2">{enquiry.studentAge ?? "N/A"}</td>
                <td className="px-3 py-2">
                  <AdminStatusUpdateForm
                    id={enquiry.id}
                    entity="enquiry"
                    value={enquiry.status}
                    options={["NEW", "CONTACTED", "CONVERTED"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
