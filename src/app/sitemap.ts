import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

function getStaticRoutes(baseUrl: string): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/course-finder`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/locations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/testimonials`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/why-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/booking-form`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/booking-enquiry-form`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/online-booking`, changeFrequency: "monthly", priority: 0.7 },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.summerschool-uk.com";
  const staticRoutes = getStaticRoutes(baseUrl);
  try {
    const [categories, courses, locations, posts] = await Promise.all([
      db.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.course.findMany({
        where: { isPublished: true },
        select: {
          slug: true,
          updatedAt: true,
          category: { select: { slug: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      db.location.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.post.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((item) => ({
      url: `${baseUrl}/courses/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const courseRoutes: MetadataRoute.Sitemap = courses.map((item) => ({
      url: `${baseUrl}/courses/${item.category.slug}/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const locationRoutes: MetadataRoute.Sitemap = locations.map((item) => ({
      url: `${baseUrl}/locations/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const postRoutes: MetadataRoute.Sitemap = posts.map((item) => ({
      url: `${baseUrl}/blog/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...courseRoutes, ...locationRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
