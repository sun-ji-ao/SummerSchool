import { db } from "@/lib/db";
import { buildBreadcrumbListJsonLd, buildCollectionPageJsonLd } from "@/lib/seo-jsonld";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

type CityContent = {
  accommodation: string[];
  activities: string[];
  sampleItinerary: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const BASE_URL = "https://www.summerschool-uk.com";

function getCityContent(city: string): CityContent {
  const normalizedCity = city.toLowerCase();
  if (normalizedCity.includes("oxford")) {
    return {
      accommodation: [
        "College residence with shared common room and supervised check-in.",
        "Single/twin student rooms depending on campus availability.",
        "24/7 emergency contact and evening duty staff support.",
      ],
      activities: [
        "Oxford college walking tour and museum visits.",
        "Debate workshops and public speaking practice sessions.",
        "Weekend day trip to London landmarks.",
      ],
      sampleItinerary: [
        "08:00 Breakfast and morning assembly",
        "09:00 Academic classes (English/Academic Skills)",
        "14:00 Project workshop or lab session",
        "17:30 Dinner and supervised study hour",
        "19:30 Evening social and house activities",
      ],
      faqs: [
        {
          question: "Can students stay together with friends?",
          answer: "Yes, roommate preferences can be requested and are assigned based on availability and safeguarding rules.",
        },
        {
          question: "Is airport transfer included?",
          answer: "Transfer can be arranged as an add-on service; final details are confirmed before arrival week.",
        },
      ],
    };
  }
  if (normalizedCity.includes("cambridge")) {
    return {
      accommodation: [
        "Secure campus residence near teaching buildings.",
        "Separate accommodation areas by age group and gender.",
        "Daily room checks and welfare support team.",
      ],
      activities: [
        "STEM and innovation challenge afternoons.",
        "Punting experience and historic city tour.",
        "Sports club sessions and international social nights.",
      ],
      sampleItinerary: [
        "08:00 Breakfast and briefing",
        "09:00 Core academic module",
        "13:30 Team challenge / project work",
        "17:00 Sports or arts activity",
        "20:00 Reflection and lights-out routine",
      ],
      faqs: [
        {
          question: "Are beginner English learners accepted?",
          answer: "Yes, students are grouped by placement results so each class level is appropriate.",
        },
        {
          question: "How often can parents receive updates?",
          answer: "Weekly progress summaries are shared, with urgent updates communicated immediately.",
        },
      ],
    };
  }
  return {
    accommodation: [
      "Central city campus residence with supervised boarding.",
      "Comfortable student rooms with study-friendly facilities.",
      "Dedicated welfare staff for health and safety support.",
    ],
    activities: [
      "City cultural tours and landmark visits.",
      "Academic workshops and communication practice.",
      "Weekend excursions and team-building events.",
    ],
    sampleItinerary: [
      "08:00 Breakfast and check-in",
      "09:00 Academic session",
      "14:00 Afternoon activities and projects",
      "18:00 Dinner and campus social program",
      "20:00 Evening wrap-up",
    ],
    faqs: [
      {
        question: "What documents are needed before arrival?",
        answer: "We provide a pre-arrival checklist covering passport, visa, insurance, and emergency contact details.",
      },
      {
        question: "Can dietary requirements be accommodated?",
        answer: "Yes, please submit dietary requirements in advance so the campus catering team can prepare accordingly.",
      },
    ],
  };
}

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
  const cityContent = getCityContent(location.city);
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <h1 className="text-3xl font-semibold capitalize">{displayName}</h1>
      <p className="mt-2 text-slate-600">{location.description ?? `${location.city} campus and courses overview.`}</p>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Accommodation</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {cityContent.accommodation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Campus Activities</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {cityContent.activities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Sample Daily Itinerary</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {cityContent.sampleItinerary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

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

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        <div className="mt-3 space-y-3">
          {cityContent.faqs.map((item) => (
            <article key={item.question} className="rounded-lg border border-slate-100 p-3">
              <h3 className="text-sm font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-700">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
