import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.summerschool-uk.com";
  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/course-finder`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/contact-us`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
