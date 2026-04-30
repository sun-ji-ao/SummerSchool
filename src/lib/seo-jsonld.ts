type JsonLdValue = Record<string, unknown>;

const BASE_URL = "https://www.summerschool-uk.com";

export function buildOrganizationJsonLd(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SummerSchool-UK",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@summerschool-uk.com",
      },
    ],
  };
}

export function buildWebSiteJsonLd(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SummerSchool-UK",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/course-finder?keyword={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

type BreadcrumbItemInput = {
  name: string;
  path: string;
};

export function buildBreadcrumbListJsonLd(items: BreadcrumbItemInput[]): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

type CollectionPageInput = {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; path: string }>;
};

export function buildCollectionPageJsonLd(input: CollectionPageInput): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: `${BASE_URL}${input.path}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE_URL}${item.path}`,
        name: item.name,
      })),
    },
  };
}

type BlogPostingInput = {
  title: string;
  description: string;
  slug: string;
  publishedAtIso: string;
  modifiedAtIso: string;
  coverImage?: string | null;
};

export function buildBlogPostingJsonLd(input: BlogPostingInput): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAtIso,
    dateModified: input.modifiedAtIso,
    mainEntityOfPage: `${BASE_URL}/blog/${input.slug}`,
    url: `${BASE_URL}/blog/${input.slug}`,
    image: input.coverImage ? [input.coverImage] : undefined,
    author: {
      "@type": "Organization",
      name: "SummerSchool-UK",
    },
    publisher: {
      "@type": "Organization",
      name: "SummerSchool-UK",
    },
  };
}

type CourseJsonLdInput = {
  title: string;
  description: string;
  categorySlug: string;
  courseSlug: string;
  city: string;
  ageMin: number;
  ageMax: number;
  price?: number | null;
  currency: string;
};

export function buildCourseJsonLd(input: CourseJsonLdInput): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.title,
    description: input.description,
    provider: {
      "@type": "Organization",
      name: "SummerSchool-UK",
      sameAs: BASE_URL,
    },
    url: `${BASE_URL}/courses/${input.categorySlug}/${input.courseSlug}`,
    educationalCredentialAwarded: "Summer School Completion",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      location: {
        "@type": "Place",
        name: input.city,
      },
      offers:
        input.price !== null && input.price !== undefined
          ? {
              "@type": "Offer",
              price: input.price,
              priceCurrency: input.currency,
              availability: "https://schema.org/InStock",
              url: `${BASE_URL}/courses/${input.categorySlug}/${input.courseSlug}`,
            }
          : undefined,
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: `Age ${input.ageMin}-${input.ageMax}`,
    },
  };
}
