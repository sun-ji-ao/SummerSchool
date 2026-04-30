import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCourseByCategoryAndSlug } from "@/server/services/catalog-service";
import { buildCourseJsonLd } from "@/lib/seo-jsonld";

type CoursePageProps = {
  params: Promise<{ category: string; slug: string }>;
};

const BASE_URL = "https://www.summerschool-uk.com";

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const course = await getCourseByCategoryAndSlug(category, slug);
  if (!course) {
    return {
      title: "Course Not Found | SummerSchool-UK",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const description =
    course.description ??
    `${course.title} in ${course.location.city} for age ${course.ageMin}-${course.ageMax}.`;
  return {
    title: `${course.title} | SummerSchool-UK`,
    description,
    alternates: {
      canonical: `${BASE_URL}/courses/${course.category.slug}/${course.slug}`,
    },
    openGraph: {
      title: `${course.title} | SummerSchool-UK`,
      description,
      url: `${BASE_URL}/courses/${course.category.slug}/${course.slug}`,
      siteName: "SummerSchool-UK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | SummerSchool-UK`,
      description,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { category, slug } = await params;
  const course = await getCourseByCategoryAndSlug(category, slug);
  if (!course) {
    return <main className="mx-auto w-full max-w-5xl px-6 py-10">Course not found.</main>;
  }
  const jsonLd = buildCourseJsonLd({
    title: course.title,
    description:
      course.description ?? `${course.title} in ${course.location.city} for age ${course.ageMin}-${course.ageMax}.`,
    categorySlug: course.category.slug,
    courseSlug: course.slug,
    city: course.location.city,
    ageMin: course.ageMin,
    ageMax: course.ageMax,
    price: course.price,
    currency: course.currency,
  });
  const relatedCourses = await db.course.findMany({
    where: {
      isPublished: true,
      categoryId: course.categoryId,
      NOT: { id: course.id },
    },
    include: {
      category: true,
      location: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="mt-2 text-slate-600">
        {course.location.city} | Age {course.ageMin}-{course.ageMax}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Category: {course.category.name}
        {course.price ? ` | Price: ${course.currency} ${course.price}` : ""}
      </p>
      {course.description ? <p className="mt-4 text-slate-700">{course.description}</p> : null}

      <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-lg font-semibold">Ready to apply?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Start your booking directly or contact our advisor for program matching support.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/booking-form?courseSlug=${course.slug}`}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Book This Course
          </Link>
          <Link
            href={`/contact-us?course=${course.slug}`}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800"
          >
            Ask an Advisor
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Related Courses</h2>
          <Link href={`/courses/${course.category.slug}`} className="text-sm text-blue-700 underline">
            View all in {course.category.name}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {relatedCourses.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">
                <Link href={`/courses/${item.category.slug}/${item.slug}`} className="hover:underline">
                  {item.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {item.location.city} | Age {item.ageMin}-{item.ageMax}
              </p>
            </article>
          ))}
          {!relatedCourses.length ? (
            <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 md:col-span-2">
              No related courses available yet.
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
