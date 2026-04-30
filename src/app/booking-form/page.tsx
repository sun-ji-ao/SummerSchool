import { db } from "@/lib/db";
import { BookingFormClient } from "./booking-form-client";

type BookingFormPageProps = {
  searchParams: Promise<{ courseSlug?: string }>;
};

export default async function BookingFormPage({ searchParams }: BookingFormPageProps) {
  const query = await searchParams;
  const courseSlug = query.courseSlug?.trim();
  const preselectedCourse = courseSlug
    ? await db.course.findFirst({
        where: {
          slug: courseSlug,
          isPublished: true,
        },
        include: {
          category: true,
          location: true,
        },
      })
    : null;
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Course Booking</h1>
      <p className="mt-2 text-slate-600">用于线下暑校预订（type=SUMMER）并跳转 Stripe 支付定金。</p>
      <BookingFormClient
        preselectedCourse={
          preselectedCourse
            ? {
                id: preselectedCourse.id,
                slug: preselectedCourse.slug,
                title: preselectedCourse.title,
                categoryName: preselectedCourse.category.name,
                city: preselectedCourse.location.city,
                price: preselectedCourse.price,
                currency: preselectedCourse.currency,
              }
            : null
        }
      />
    </main>
  );
}
