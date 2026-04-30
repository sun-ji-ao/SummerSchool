import { courses } from "@/lib/site-data";

type CoursePageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) {
    return <main className="mx-auto w-full max-w-5xl px-6 py-10">Course not found.</main>;
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="mt-2 text-slate-600">
        {course.city} | Age {course.ageMin}-{course.ageMax}
      </p>
    </main>
  );
}
