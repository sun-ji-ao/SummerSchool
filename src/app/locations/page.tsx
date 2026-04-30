import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
    include: {
      courses: {
        where: { isPublished: true },
        select: { id: true },
      },
    },
  });
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Locations</h1>
      <p className="mt-2 text-slate-600">Browse all available UK summer school cities and campuses.</p>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {locations.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">
              <Link href={`/locations/${item.slug}`} className="hover:underline">
                {item.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-slate-600">{item.city}</p>
            {item.description ? <p className="mt-2 text-sm text-slate-700">{item.description}</p> : null}
            <p className="mt-2 text-xs text-slate-500">Published courses: {item.courses.length}</p>
          </article>
        ))}
        {!locations.length ? (
          <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 md:col-span-2">
            No locations found.
          </article>
        ) : null}
      </section>
    </main>
  );
}
