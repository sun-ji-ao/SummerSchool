import Link from "next/link";
import { db } from "@/lib/db";
import { PublishToggle } from "@/app/admin/publish-toggle";

export const dynamic = "force-dynamic";

type AdminCoursesPageProps = {
  searchParams: Promise<{ q?: string; category?: string; published?: string }>;
};

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  const query = await searchParams;
  const keyword = query.q?.trim();
  const category = query.category?.trim();
  const published = query.published?.trim();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  const courses = await db.course.findMany({
    where: {
      ...(keyword
        ? {
            title: {
              contains: keyword,
              mode: "insensitive",
            },
          }
        : {}),
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
      ...(published === "true" ? { isPublished: true } : {}),
      ...(published === "false" ? { isPublished: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      category: true,
      location: true,
    },
  });
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Courses</h1>
        <div className="inline-flex gap-4 text-sm">
          <Link href="/admin/courses/import" className="text-blue-700 underline">
            Import CSV
          </Link>
          <Link href="/admin" className="text-blue-700 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          type="text"
          name="q"
          placeholder="Search by title"
          defaultValue={keyword ?? ""}
        />
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          name="category"
          defaultValue={category ?? ""}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          name="published"
          defaultValue={published ?? ""}
        >
          <option value="">All publish states</option>
          <option value="true">Published only</option>
          <option value="false">Draft only</option>
        </select>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white" type="submit">
          Apply filters
        </button>
      </form>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Age Range</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Published</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{course.title}</td>
                <td className="px-3 py-2">{course.category.name}</td>
                <td className="px-3 py-2">{course.location.city}</td>
                <td className="px-3 py-2">
                  {course.ageMin}-{course.ageMax}
                </td>
                <td className="px-3 py-2">{course.price ?? "N/A"}</td>
                <td className="px-3 py-2">
                  <PublishToggle endpoint={`/api/admin/courses/${course.id}/publish`} initialValue={course.isPublished} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
