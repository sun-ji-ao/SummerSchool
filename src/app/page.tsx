import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildOrganizationJsonLd } from "@/lib/seo-jsonld";

export const dynamic = "force-dynamic";
const BASE_URL = "https://www.summerschool-uk.com";

export const metadata: Metadata = {
  title: "Summer School UK | Live, Learn, and Grow in the UK",
  description:
    "Explore UK summer school programs with course finder, city options, student testimonials, and parent guides.",
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: "Summer School UK | Live, Learn, and Grow in the UK",
    description:
      "Explore UK summer school programs with course finder, city options, student testimonials, and parent guides.",
    url: `${BASE_URL}/`,
    siteName: "SummerSchool-UK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Summer School UK | Live, Learn, and Grow in the UK",
    description:
      "Explore UK summer school programs with course finder, city options, student testimonials, and parent guides.",
  },
};

export default async function Home() {
  const [featuredPosts, featuredTestimonials] = await Promise.all([
    db.post.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
      take: 3,
    }),
  ]);
  const organizationJsonLd = buildOrganizationJsonLd();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <section className="rounded-2xl bg-slate-900 px-8 py-14 text-white">
        <p className="mb-4 text-sm uppercase tracking-widest text-slate-300">SummerSchool-UK</p>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Live, Learn, and Grow in the UK</h1>
        <p className="max-w-3xl text-slate-200">
          参考原站信息架构重建，增强按年龄找课、课程推荐、线索转化与预订支付流程。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {["London", "Oxford", "Cambridge", "UK Schools"].map((city) => (
          <div key={city} className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold">{city}</h2>
            <p className="mt-2 text-sm text-slate-600">Live and study in top schools and universities.</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          "English Courses",
          "Academic Courses",
          "University Preparation",
          "Elite Immersion",
          "English Plus",
          "Tutoring Courses",
        ].map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">{item}</h3>
            <p className="mt-2 text-sm text-slate-600">课程详情与筛选能力将由数据库驱动生成。</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Blog Posts</h2>
          <Link href="/blog" className="text-sm text-blue-700 underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-slate-600">{post.excerpt ?? "No excerpt available."}</p>
            </article>
          ))}
          {!featuredPosts.length ? (
            <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 md:col-span-3">
              No published blog posts yet.
            </article>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Student Testimonials</h2>
          <Link href="/testimonials" className="text-sm text-blue-700 underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredTestimonials.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm leading-7 text-slate-700">{item.content}</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{item.studentName}</p>
            </article>
          ))}
          {!featuredTestimonials.length ? (
            <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 md:col-span-3">
              No published testimonials yet.
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
