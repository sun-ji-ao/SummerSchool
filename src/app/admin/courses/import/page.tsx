import Link from "next/link";
import { ImportCoursesClient } from "@/app/admin/courses/import/import-courses-client";

export default function AdminCourseImportPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin · Course Import (CSV)</h1>
        <div className="inline-flex gap-4 text-sm">
          <Link href="/admin/courses" className="text-blue-700 underline">
            Back to courses
          </Link>
          <Link href="/admin" className="text-blue-700 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        字段映射文档：请参考 `docs/course-import-mapping.md`。建议先在测试数据上执行一次。
      </p>
      <ImportCoursesClient />
    </main>
  );
}
