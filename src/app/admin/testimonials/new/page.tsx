import Link from "next/link";
import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Testimonial</h1>
        <Link href="/admin/testimonials" className="text-sm text-blue-700 underline">
          Back to testimonials
        </Link>
      </div>
      <TestimonialForm
        mode="create"
        initialValue={{
          studentName: "",
          country: "",
          content: "",
          programName: "",
          displayOrder: 0,
          isPublished: true,
        }}
      />
    </main>
  );
}
