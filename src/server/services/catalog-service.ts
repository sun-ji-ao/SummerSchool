import { db } from "@/lib/db";

export type FinderFilters = {
  age?: number;
  city?: string;
  category?: string;
  keyword?: string;
};

export async function findCourses(filters: FinderFilters) {
  return db.course.findMany({
    where: {
      isPublished: true,
      ...(filters.age
        ? {
            ageMin: { lte: filters.age },
            ageMax: { gte: filters.age },
          }
        : {}),
      ...(filters.keyword
        ? {
            title: {
              contains: filters.keyword,
              mode: "insensitive",
            },
          }
        : {}),
      ...(filters.category
        ? {
            category: {
              slug: filters.category,
            },
          }
        : {}),
      ...(filters.city
        ? {
            location: {
              city: {
                contains: filters.city,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },
    include: {
      category: true,
      location: true,
    },
    orderBy: [{ category: { name: "asc" } }, { title: "asc" }],
  });
}

export async function getCoursesByCategory(categorySlug: string) {
  return db.course.findMany({
    where: {
      isPublished: true,
      category: {
        slug: categorySlug,
      },
    },
    include: {
      location: true,
      category: true,
    },
    orderBy: {
      title: "asc",
    },
  });
}

export async function getCourseByCategoryAndSlug(categorySlug: string, courseSlug: string) {
  return db.course.findFirst({
    where: {
      slug: courseSlug,
      category: {
        slug: categorySlug,
      },
    },
    include: {
      category: true,
      location: true,
    },
  });
}
