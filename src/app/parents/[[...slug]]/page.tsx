import Link from "next/link";
import { notFound } from "next/navigation";

type ParentsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

type ParentContentPage = {
  title: string;
  intro: string;
  sections: Array<{ heading: string; points: string[] }>;
};

const CONTENT_MAP: Record<string, ParentContentPage> = {
  index: {
    title: "Parents Area",
    intro: "Essential guidance, policies, and support information for families before and during the program.",
    sections: [
      {
        heading: "Before Arrival",
        points: [
          "Complete travel and emergency contact forms at least two weeks before arrival.",
          "Review visa, insurance, and medication declarations using the pre-departure checklist.",
        ],
      },
      {
        heading: "During Program",
        points: [
          "Weekly progress updates are shared with parents by email.",
          "Our welfare team provides 24/7 emergency support for all enrolled students.",
        ],
      },
    ],
  },
  terms: {
    title: "Parent Terms",
    intro: "A concise summary of booking, payment, cancellation, and conduct terms.",
    sections: [
      {
        heading: "Booking and Payment",
        points: [
          "A booking is confirmed only after required deposit payment is received.",
          "Remaining balance deadlines are listed in each booking confirmation email.",
        ],
      },
      {
        heading: "Cancellation Policy",
        points: [
          "Cancellation timelines and fee terms are applied according to program contract.",
          "Refund requests are processed to the original payment method where applicable.",
        ],
      },
    ],
  },
  faq: {
    title: "Parent FAQ",
    intro: "Frequently asked questions covering accommodation, safety, and communication.",
    sections: [
      {
        heading: "Accommodation and Welfare",
        points: [
          "Students are grouped by age and safeguarding requirements in supervised residences.",
          "Dietary and medical needs are supported when submitted in advance.",
        ],
      },
      {
        heading: "Communication",
        points: [
          "Families receive regular updates and can contact the support team anytime.",
          "Urgent welfare matters are escalated immediately through emergency channels.",
        ],
      },
    ],
  },
  safeguarding: {
    title: "Safeguarding Overview",
    intro: "Our safeguarding process focuses on prevention, supervision, and rapid response.",
    sections: [
      {
        heading: "Safety Framework",
        points: [
          "All campuses operate under age-appropriate supervision policies.",
          "Staff follow incident reporting and escalation protocols for every concern.",
        ],
      },
      {
        heading: "Parent Collaboration",
        points: [
          "Parents can provide welfare notes before arrival to support student adjustment.",
          "Our team coordinates with families for any wellbeing-related follow-up.",
        ],
      },
    ],
  },
};

export default async function ParentsPage({ params }: ParentsPageProps) {
  const resolved = await params;
  const path = resolved.slug?.join("/") ?? "index";
  const content = CONTENT_MAP[path];
  if (!content) {
    notFound();
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{content.title}</h1>
      <p className="mt-2 text-slate-600">{content.intro}</p>
      <div className="mt-6 space-y-4">
        {content.sections.map((section) => (
          <section key={section.heading} className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/parents" className="text-blue-700 underline">
          Parents Home
        </Link>
        <Link href="/parents/faq" className="text-blue-700 underline">
          FAQ
        </Link>
        <Link href="/parents/terms" className="text-blue-700 underline">
          Terms
        </Link>
        <Link href="/parents/safeguarding" className="text-blue-700 underline">
          Safeguarding
        </Link>
      </div>
    </main>
  );
}
