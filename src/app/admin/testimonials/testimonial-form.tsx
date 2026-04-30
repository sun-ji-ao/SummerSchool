"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TestimonialFormProps = {
  mode: "create" | "edit";
  testimonialId?: number;
  initialValue: {
    studentName: string;
    country: string;
    content: string;
    programName: string;
    displayOrder: number;
    isPublished: boolean;
  };
};

export function TestimonialForm({ mode, testimonialId, initialValue }: TestimonialFormProps) {
  const router = useRouter();
  const [studentName, setStudentName] = useState(initialValue.studentName);
  const [country, setCountry] = useState(initialValue.country);
  const [content, setContent] = useState(initialValue.content);
  const [programName, setProgramName] = useState(initialValue.programName);
  const [displayOrder, setDisplayOrder] = useState(String(initialValue.displayOrder));
  const [isPublished, setIsPublished] = useState(initialValue.isPublished);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const endpoint = mode === "create" ? "/api/admin/testimonials" : `/api/admin/testimonials/${testimonialId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName,
        country,
        content,
        programName,
        displayOrder: Number(displayOrder || "0"),
        isPublished,
      }),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Save failed");
      setLoading(false);
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded border px-3 py-2"
          placeholder="Student name"
          value={studentName}
          onChange={(event) => setStudentName(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Country"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Program name"
          value={programName}
          onChange={(event) => setProgramName(event.target.value)}
        />
        <input
          className="rounded border px-3 py-2"
          placeholder="Display order"
          value={displayOrder}
          onChange={(event) => setDisplayOrder(event.target.value)}
        />
        <textarea
          className="min-h-[180px] rounded border px-3 py-2 md:col-span-2"
          placeholder="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>
      <label className="mt-3 inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => setIsPublished(event.target.checked)}
        />
        Published
      </label>
      <div className="mt-4">
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "create" ? "Create Testimonial" : "Save Changes"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
