import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildBreadcrumbListJsonLd, buildWebSiteJsonLd } from "@/lib/seo-jsonld";

export const dynamic = "force-dynamic";
const BASE_URL = "https://www.summerschool-uk.com";

export const metadata: Metadata = {
  title: "Blog | SummerSchool-UK",
  description: "Read parent guides and updates about UK summer school planning.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | SummerSchool-UK",
    description: "Read parent guides and updates about UK summer school planning.",
    url: `${BASE_URL}/blog`,
    siteName: "SummerSchool-UK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | SummerSchool-UK",
    description: "Read parent guides and updates about UK summer school planning.",
  },
};

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
  const websiteJsonLd = buildWebSiteJsonLd();
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="mt-2 text-sm text-slate-600">Latest updates for parents and students.</p>
      <section className="mt-6 space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-xl font-semibold text-slate-900">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-slate-600">{post.excerpt ?? "No excerpt available."}</p>
            <p className="mt-2 text-xs text-slate-500">
              {post.publishedAt?.toISOString().slice(0, 10) ?? post.createdAt.toISOString().slice(0, 10)}
            </p>
          </article>
        ))}
        {!posts.length ? (
          <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No published posts yet.
          </article>
        ) : null}
      </section>
    </main>
  );
}
