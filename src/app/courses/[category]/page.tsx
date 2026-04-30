import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { buildBreadcrumbListJsonLd, buildCollectionPageJsonLd } from "@/lib/seo-jsonld";
import { getCoursesByCategory } from "@/server/services/catalog-service";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

const BASE_URL = "https://www.summerschool-uk.com";

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryRecord = await db.category.findUnique({
    where: { slug: category },
    select: { name: true },
  });
  if (!categoryRecord) {
    return {
      title: "Category Not Found | SummerSchool-UK",
      robots: { index: false, follow: false },
    };
  }
  const description = `Explore ${categoryRecord.name} in UK summer schools.`;
  return {
    title: `${categoryRecord.name} | SummerSchool-UK`,
    description,
    alternates: { canonical: `${BASE_URL}/courses/${category}` },
    openGraph: {
      title: `${categoryRecord.name} | SummerSchool-UK`,
      description,
      url: `${BASE_URL}/courses/${category}`,
      siteName: "SummerSchool-UK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryRecord.name} | SummerSchool-UK`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryRecord = await db.category.findUnique({
    where: { slug: category },
    select: { name: true, slug: true },
  });
  if (!categoryRecord) {
    notFound();
  }
  const list = await getCoursesByCategory(category);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: "Home", path: "/" },
    { name: "Courses", path: `/courses/${categoryRecord.slug}` },
  ]);
  const collectionJsonLd = buildCollectionPageJsonLd({
    name: categoryRecord.name,
    description: `Explore ${categoryRecord.name} in UK summer schools.`,
    path: `/courses/${categoryRecord.slug}`,
    items: list.map((course) => ({
      name: course.title,
      path: `/courses/${categoryRecord.slug}/${course.slug}`,
    })),
  });
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <h1 className="text-3xl font-semibold">{categoryRecord.name}</h1>
      <div className="mt-6 grid gap-4">
        {list.map((course) => (
          <article key={course.slug} className="rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold">
              <Link href={`/courses/${categoryRecord.slug}/${course.slug}`} className="hover:underline">
                {course.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-600">
              {course.location.city} | Age {course.ageMin}-{course.ageMax}
            </p>
          </article>
        ))}
        {!list.length ? (
          <article className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
            No published courses in this category yet.
          </article>
        ) : null}
      </div>
    </main>
  );
}
