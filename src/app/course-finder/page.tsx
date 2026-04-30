import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildBreadcrumbListJsonLd, buildWebSiteJsonLd } from "@/lib/seo-jsonld";
import { findCourses } from "@/server/services/catalog-service";

type FinderPageProps = {
  searchParams: Promise<{ age?: string; city?: string; category?: string; keyword?: string }>;
};

const BASE_URL = "https://www.summerschool-uk.com";

export const metadata: Metadata = {
  title: "Course Finder | SummerSchool-UK",
  description: "Find UK summer school courses by age, city, category, and keyword.",
  alternates: {
    canonical: `${BASE_URL}/course-finder`,
  },
  openGraph: {
    title: "Course Finder | SummerSchool-UK",
    description: "Find UK summer school courses by age, city, category, and keyword.",
    url: `${BASE_URL}/course-finder`,
    siteName: "SummerSchool-UK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Course Finder | SummerSchool-UK",
    description: "Find UK summer school courses by age, city, category, and keyword.",
  },
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
  const [featuredPosts, featuredTestimonials] = await Promise.all([
    db.post.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 2,
    }),
    db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
      take: 2,
    }),
  ]);
  const websiteJsonLd = buildWebSiteJsonLd();
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: "Home", path: "/" },
    { name: "Course Finder", path: "/course-finder" },
  ]);
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Parent Guide</h2>
            <Link href="/blog" className="text-xs text-blue-700 underline">
              More posts
            </Link>
          </div>
          <div className="space-y-3">
            {featuredPosts.map((post) => (
              <div key={post.id}>
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-slate-900 hover:underline">
                  {post.title}
                </Link>
                <p className="text-xs text-slate-600">{post.excerpt ?? "No excerpt available."}</p>
              </div>
            ))}
            {!featuredPosts.length ? <p className="text-sm text-slate-500">No published posts yet.</p> : null}
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Family Feedback</h2>
            <Link href="/testimonials" className="text-xs text-blue-700 underline">
              More testimonials
            </Link>
          </div>
          <div className="space-y-3">
            {featuredTestimonials.map((item) => (
              <div key={item.id}>
                <p className="text-sm text-slate-700">{item.content}</p>
                <p className="text-xs font-medium text-slate-900">{item.studentName}</p>
              </div>
            ))}
            {!featuredTestimonials.length ? (
              <p className="text-sm text-slate-500">No published testimonials yet.</p>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
