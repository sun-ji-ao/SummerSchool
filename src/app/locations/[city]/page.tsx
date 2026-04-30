import { db } from "@/lib/db";
import { buildBreadcrumbListJsonLd, buildCollectionPageJsonLd } from "@/lib/seo-jsonld";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

const BASE_URL = "https://www.summerschool-uk.com";

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const location = await db.location.findFirst({
    where: { slug: city },
    select: { name: true, city: true, description: true },
  });
  if (!location) {
    return {
      title: "Location Not Found | SummerSchool-UK",
      robots: { index: false, follow: false },
    };
  }
  const description = location.description ?? `${location.city} campus and summer school programs overview.`;
  return {
    title: `${location.name} | SummerSchool-UK`,
    description,
    alternates: { canonical: `${BASE_URL}/locations/${city}` },
    openGraph: {
      title: `${location.name} | SummerSchool-UK`,
      description,
      url: `${BASE_URL}/locations/${city}`,
      siteName: "SummerSchool-UK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} | SummerSchool-UK`,
      description,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const location = await db.location.findFirst({
    where: {
      slug: city,
    },
    include: {
      courses: {
        where: { isPublished: true },
        include: {
          category: true,
        },
        orderBy: { title: "asc" },
      },
    },
  });
  if (!location) {
    notFound();
  }
  const displayName = location.name;
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
    { name: displayName, path: `/locations/${city}` },
  ]);
  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `${displayName} Courses`,
    description: location.description ?? `${location.city} campus and summer school programs overview.`,
    path: `/locations/${city}`,
    items: location.courses.map((course) => ({
      name: course.title,
      path: `/courses/${course.category.slug}/${course.slug}`,
    })),
  });
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <h1 className="text-3xl font-semibold capitalize">{displayName}</h1>
      <p className="mt-2 text-slate-600">{location.description ?? `${location.city} campus and courses overview.`}</p>
      <section className="mt-6 grid gap-4">
        {location.courses.map((course) => (
          <article key={course.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">
              <Link href={`/courses/${course.category.slug}/${course.slug}`} className="hover:underline">
                {course.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {course.category.name} | Age {course.ageMin}-{course.ageMax}
            </p>
          </article>
        ))}
        {!location.courses.length ? (
          <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No published courses in this location yet.
          </article>
        ) : null}
      </section>
    </main>
  );
}
