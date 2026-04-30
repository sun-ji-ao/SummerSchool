import Link from "next/link";
import { db } from "@/lib/db";
import { PublishToggle } from "@/app/admin/publish-toggle";
import { DeleteRowButton } from "@/app/admin/delete-row-button";

type TestimonialSearchParams = Promise<{
  q?: string;
  published?: string;
  page?: string;
}>;

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: TestimonialSearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const published = params.published ?? "all";
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = 20;
  const where = {
    ...(q
      ? {
          OR: [
            { studentName: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(published === "published" ? { isPublished: true } : {}),
    ...(published === "draft" ? { isPublished: false } : {}),
  };
  const [rows, total] = await Promise.all([
    db.testimonial.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.testimonial.count({ where }),
  ]);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Testimonial Management</h1>
        <div className="inline-flex gap-4 text-sm">
          <Link href="/admin/testimonials/new" className="text-blue-700 underline">
            Create Testimonial
          </Link>
          <Link href="/admin" className="text-slate-600 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
      <form className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name/quote"
          className="rounded border px-3 py-2"
        />
        <select name="published" defaultValue={published} className="rounded border px-3 py-2">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <input type="hidden" name="page" value="1" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Apply Filters
        </button>
      </form>
      <div className="mt-6 overflow-auto rounded-xl border border-slate-200 bg-white p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Content</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2">Publish</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-3 py-2">#{item.id}</td>
                <td className="px-3 py-2">{item.studentName}</td>
                <td className="px-3 py-2">{item.content.slice(0, 80)}</td>
                <td className="px-3 py-2">{item.updatedAt.toISOString().slice(0, 10)}</td>
                <td className="px-3 py-2">
                  <PublishToggle
                    endpoint={`/api/admin/testimonials/${item.id}/publish`}
                    initialValue={item.isPublished}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/testimonials/${item.id}/edit`} className="text-xs text-blue-700 underline">
                      Edit
                    </Link>
                    <DeleteRowButton
                      endpoint={`/api/admin/testimonials/${item.id}`}
                      confirmText="Delete this testimonial?"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  No testimonials found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <p>
          Total {total} records, page {currentPage}/{totalPages}
        </p>
      </div>
    </main>
  );
}
