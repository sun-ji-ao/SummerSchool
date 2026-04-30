import { getCoursesByCategory } from "@/server/services/catalog-service";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const list = await getCoursesByCategory(category);
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold capitalize">{category.replaceAll("-", " ")}</h1>
      <div className="mt-6 grid gap-4">
        {list.map((course) => (
          <article key={course.slug} className="rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold">{course.title}</h2>
            <p className="text-sm text-slate-600">{course.location.city}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
