import { findCourses } from "@/server/services/catalog-service";

type FinderPageProps = {
  searchParams: Promise<{ age?: string; city?: string; category?: string; keyword?: string }>;
};

export default async function CourseFinderPage({ searchParams }: FinderPageProps) {
  const params = await searchParams;
  const age = Number(params.age ?? 0);
  const city = params.city?.toLowerCase();
  const category = params.category?.toLowerCase();
  const keyword = params.keyword?.toLowerCase();
  const filtered = await findCourses({
    age: age > 0 ? age : undefined,
    city,
    category,
    keyword,
  });
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Course Finder</h1>
      <p className="mt-2 text-slate-600">通过 URL query 执行筛选（age/city/category/keyword）。</p>
      <div className="mt-6 grid gap-4">
        {filtered.map((course) => (
          <article key={course.slug} className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">{course.title}</h2>
            <p className="text-sm text-slate-600">
              {course.location.city} | {course.category.slug} | Age {course.ageMin}-{course.ageMax}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
