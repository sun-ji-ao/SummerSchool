import { ContactFormClient } from "./contact-form-client";

type ContactUsPageProps = {
  searchParams: Promise<{
    source?: string;
    course?: string;
    city?: string;
  }>;
};

export default async function ContactUsPage({ searchParams }: ContactUsPageProps) {
  const params = await searchParams;
  const source = params.source?.trim() || "contact-form";
  const course = params.course?.trim() || "";
  const city = params.city?.trim() || "";
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Contact Us</h1>
      <ContactFormClient initialSource={source} initialCourse={course} initialCity={city} />
    </main>
  );
}
