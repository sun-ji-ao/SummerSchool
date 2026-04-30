import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export default async function EditTestimonialPage({ params }: RouteParams) {
  const { id } = await params;
  const testimonialId = Number(id);
  if (!Number.isFinite(testimonialId)) {
    notFound();
  }
  const testimonial = await db.testimonial.findUnique({ where: { id: testimonialId } });
  if (!testimonial) {
    notFound();
  }
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Testimonial #{testimonial.id}</h1>
        <Link href="/admin/testimonials" className="text-sm text-blue-700 underline">
          Back to testimonials
        </Link>
      </div>
      <TestimonialForm
        mode="edit"
        testimonialId={testimonial.id}
        initialValue={{
          studentName: testimonial.studentName,
          country: testimonial.country ?? "",
          content: testimonial.content,
          programName: testimonial.programName ?? "",
          displayOrder: testimonial.displayOrder,
          isPublished: testimonial.isPublished,
        }}
      />
    </main>
  );
}
