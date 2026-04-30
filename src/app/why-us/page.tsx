import Link from "next/link";

export default function WhyUsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Why Us</h1>
      <p className="mt-3 text-slate-600">
        Families choose SummerSchool-UK for practical planning support, dependable communication, and program matching
        built around student needs.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Academic Fit",
            text: "Course suggestions aligned with age, language level, and learning goals.",
          },
          {
            title: "Safeguarding Awareness",
            text: "Parent-facing process that highlights welfare, supervision, and emergency communication.",
          },
          {
            title: "Operational Clarity",
            text: "Track enquiry, booking, and payment status through a transparent workflow.",
          },
          {
            title: "Responsive Support",
            text: "Fast response for key questions on city choice, course options, and pre-arrival preparation.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Parent Benefits</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Clear recommendation rationale by city/course/age profile.</li>
          <li>Simple online forms for enquiry, booking, and contact updates.</li>
          <li>Structured information pages for terms, FAQ, and safeguarding.</li>
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold">Take the Next Step</h2>
        <p className="mt-2 text-sm text-slate-700">Compare suitable options first, then lock in the right program.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/course-finder" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
            Start Course Finder
          </Link>
          <Link href="/booking-enquiry-form" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm">
            Submit Enquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
