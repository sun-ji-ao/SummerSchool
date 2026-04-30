import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    take: 50,
  });
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Testimonials</h1>
      <p className="mt-2 text-sm text-slate-600">Feedback from our students and families.</p>
      <section className="mt-6 grid gap-4">
        {testimonials.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm leading-7 text-slate-700">{item.content}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">
              {item.studentName}
              {item.country ? ` · ${item.country}` : ""}
            </p>
            <p className="text-xs text-slate-500">{item.programName ?? "Summer Program"}</p>
          </article>
        ))}
        {!testimonials.length ? (
          <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No testimonials published yet.
          </article>
        ) : null}
      </section>
    </main>
  );
}
