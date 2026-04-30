import Link from "next/link";

export default function AboutUsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">About Us</h1>
      <p className="mt-3 text-slate-600">
        SummerSchool-UK supports families in planning safe, high-quality UK summer learning journeys with transparent
        guidance from enquiry to enrollment.
      </p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Our Mission</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          We connect students with suitable UK programs based on age, academic goals, and preferred city, while
          keeping communication clear and parent-friendly.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold">How We Work</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Understand student profile and family expectations.</li>
          <li>Recommend matched courses and campus options.</li>
          <li>Support booking, payment, pre-arrival, and parent communication.</li>
        </ol>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { title: "Transparent Process", text: "Clear steps, clear timelines, and clear status updates." },
          { title: "Parent-Centered Support", text: "Practical guidance from enquiry to arrival." },
          { title: "Program Fit First", text: "Recommendations focus on suitability, not one-size-fits-all." },
        ].map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold">Ready to Plan?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Start with course discovery or contact us directly for personalized recommendations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/course-finder" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
            Find Courses
          </Link>
          <Link href="/contact-us?source=about-us" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm">
            Contact Advisor
          </Link>
        </div>
      </section>
    </main>
  );
}
