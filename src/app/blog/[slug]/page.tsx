import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildBlogPostingJsonLd } from "@/lib/seo-jsonld";

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
const BASE_URL = "https://www.summerschool-uk.com";

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
    },
  });
  if (!post) {
    return {
      title: "Blog Post Not Found | SummerSchool-UK",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const description = post.excerpt ?? post.content.slice(0, 160);
  return {
    title: `${post.title} | SummerSchool-UK`,
    description,
    alternates: {
      canonical: `${BASE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | SummerSchool-UK`,
      description,
      url: `${BASE_URL}/blog/${slug}`,
      siteName: "SummerSchool-UK",
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | SummerSchool-UK`,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await db.post.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });
  if (!post) {
    notFound();
  }
  const jsonLd = buildBlogPostingJsonLd({
    title: post.title,
    description: post.excerpt ?? post.content.slice(0, 160),
    slug: post.slug,
    publishedAtIso: (post.publishedAt ?? post.createdAt).toISOString(),
    modifiedAtIso: post.updatedAt.toISOString(),
    coverImage: post.coverImage,
  });
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="text-sm text-blue-700 underline">
        Back to blog
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">{post.title}</h1>
      <p className="mt-2 text-xs text-slate-500">
        {post.publishedAt?.toISOString().slice(0, 10) ?? post.createdAt.toISOString().slice(0, 10)}
      </p>
      {post.excerpt ? <p className="mt-4 text-base text-slate-700">{post.excerpt}</p> : null}
      <article className="prose mt-6 max-w-none whitespace-pre-wrap text-slate-800">{post.content}</article>
    </main>
  );
}
