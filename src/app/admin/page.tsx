import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let courseCount = 0;
  let contactCount = 0;
  let enquiryCount = 0;
  let bookingCount = 0;
  let paymentCount = 0;
  let postCount = 0;
  let testimonialCount = 0;
  let recentBookings: Array<{
    id: number;
    userEmail: string;
    status: string;
    payments: Array<{ status: string }>;
  }> = [];
  let recentContacts: Array<{
    id: number;
    name: string;
    email: string;
    source: string | null;
  }> = [];
  let loadError: string | null = null;
  try {
    [
      courseCount,
      contactCount,
      enquiryCount,
      bookingCount,
      paymentCount,
      postCount,
      testimonialCount,
      recentBookings,
      recentContacts,
    ] =
      await Promise.all([
        db.course.count(),
        db.contact.count(),
        db.bookingEnquiry.count(),
        db.booking.count(),
        db.payment.count(),
        db.post.count(),
        db.testimonial.count(),
        db.booking.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
        }),
        db.contact.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);
  } catch {
    loadError = "Database is temporarily unavailable. Please retry in a few minutes.";
  }
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <Link href="/admin/login" className="rounded bg-slate-900 px-4 py-2 text-white">
          Admin Login
        </Link>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {[
          { label: "Courses", value: courseCount },
          { label: "Contacts", value: contactCount },
          { label: "Enquiries", value: enquiryCount },
          { label: "Bookings", value: bookingCount },
          { label: "Payments", value: paymentCount },
          { label: "Posts", value: postCount },
          { label: "Testimonials", value: testimonialCount },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">#{booking.id}</td>
                    <td className="px-2 py-2">{booking.userEmail}</td>
                    <td className="px-2 py-2">{booking.status}</td>
                    <td className="px-2 py-2">{booking.payments[0]?.status ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Recent Contacts</h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">{contact.name}</td>
                    <td className="px-2 py-2">{contact.email}</td>
                    <td className="px-2 py-2">{contact.source ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        当前后台已支持基础状态操作。快速入口：
        <span className="ml-2 inline-flex gap-3">
          <Link href="/admin/courses" className="underline">
            Courses
          </Link>
          <Link href="/admin/categories" className="underline">
            Categories
          </Link>
          <Link href="/admin/locations" className="underline">
            Locations
          </Link>
          <Link href="/admin/bookings" className="underline">
            Bookings
          </Link>
          <Link href="/admin/enquiries" className="underline">
            Enquiries
          </Link>
          <Link href="/admin/payments" className="underline">
            Payments
          </Link>
          <Link href="/admin/posts" className="underline">
            Posts
          </Link>
          <Link href="/admin/testimonials" className="underline">
            Testimonials
          </Link>
        </span>
      </section>
      {loadError ? (
        <section className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </section>
      ) : null}
    </main>
  );
}
