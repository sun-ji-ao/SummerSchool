import Link from "next/link";
import { BookingEnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { AdminStatusUpdateForm } from "@/app/admin/admin-status-update-form";

export const dynamic = "force-dynamic";

type AdminEnquiriesPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function AdminEnquiriesPage({ searchParams }: AdminEnquiriesPageProps) {
  const params = await searchParams;
  const pageSize = 20;
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim();
  const status = params.status?.trim() as BookingEnquiryStatus | undefined;
  const where = {
    ...(q
      ? {
          OR: [
            { parentName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };
  const [enquiries, total] = await Promise.all([
    db.bookingEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.bookingEnquiry.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const queryBase = `q=${encodeURIComponent(q ?? "")}&status=${encodeURIComponent(status ?? "")}`;
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Enquiries</h1>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          type="text"
          name="q"
          placeholder="Search by parent/email"
          defaultValue={q ?? ""}
        />
        <select className="rounded border border-slate-300 px-3 py-2 text-sm" name="status" defaultValue={status ?? ""}>
          <option value="">All status</option>
          {["NEW", "CONTACTED", "CONVERTED"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
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
      <div className="mt-4 flex items-center justify-between text-sm">
        <p>
          Page {currentPage} / {totalPages} · Total {total}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/admin/enquiries?${queryBase}&page=${prevPage}`}
            className={`underline ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            Prev
          </Link>
          <Link
            href={`/admin/enquiries?${queryBase}&page=${nextPage}`}
            className={`underline ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
