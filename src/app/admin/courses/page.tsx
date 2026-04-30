import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
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
        <Link href="/admin" className="text-sm text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
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
                <td className="px-3 py-2">{course.isPublished ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
