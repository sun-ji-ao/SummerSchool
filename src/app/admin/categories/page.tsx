import Link from "next/link";
import { db } from "@/lib/db";
import { DeleteRowButton } from "@/app/admin/delete-row-button";
import { CategoryCreateForm } from "@/app/admin/categories/category-create-form";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Categories</h1>
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
      <CategoryCreateForm />
      <div className="mt-6 overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Courses</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.slug}</td>
                <td className="px-3 py-2">{item._count.courses}</td>
                <td className="px-3 py-2">
                  <DeleteRowButton endpoint={`/api/admin/categories/${item.id}`} confirmText="Delete this category?" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
