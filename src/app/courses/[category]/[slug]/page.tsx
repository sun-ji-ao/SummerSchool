import { getCourseByCategoryAndSlug } from "@/server/services/catalog-service";

type CoursePageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { category, slug } = await params;
  const course = await getCourseByCategoryAndSlug(category, slug);
  if (!course) {
    return <main className="mx-auto w-full max-w-5xl px-6 py-10">Course not found.</main>;
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="mt-2 text-slate-600">
        {course.location.city} | Age {course.ageMin}-{course.ageMax}
      </p>
      {course.description ? <p className="mt-4 text-slate-700">{course.description}</p> : null}
    </main>
  );
}
