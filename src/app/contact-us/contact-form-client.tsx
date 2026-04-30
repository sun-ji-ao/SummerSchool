"use client";

import { FormEvent, useState } from "react";

type ContactFormClientProps = {
  initialSource: string;
  initialCourse: string;
  initialCity: string;
};

type SubmitState = {
  loading: boolean;
  success?: string;
  error?: string;
};

export function ContactFormClient({ initialSource, initialCourse, initialCity }: ContactFormClientProps) {
  const [state, setState] = useState<SubmitState>({ loading: false });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const source = String(form.get("source") ?? "").trim();
    const course = String(form.get("course") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const sourceParts = [source || "contact-form", course ? `course:${course}` : "", city ? `city:${city}` : ""].filter(
      Boolean,
    );
    const sourceTag = sourceParts.join(" | ");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || undefined,
        message,
        source: sourceTag,
      }),
    });
    const result = (await response.json()) as { error?: string; id?: number };
    if (!response.ok) {
      setState({ loading: false, error: result.error ?? "Submit failed" });
      return;
    }
    setState({ loading: false, success: `Submitted successfully (#${result.id ?? "-"})` });
    event.currentTarget.reset();
  }

  const messageHint = [initialCourse ? `Course: ${initialCourse}` : "", initialCity ? `City: ${initialCity}` : ""]
    .filter(Boolean)
    .join(" | ");

  return (
    <form className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6" onSubmit={handleSubmit}>
      <input className="rounded border border-slate-300 px-3 py-2" name="name" placeholder="Name" required />
      <input className="rounded border border-slate-300 px-3 py-2" name="email" placeholder="Email" type="email" required />
      <input className="rounded border border-slate-300 px-3 py-2" name="phone" placeholder="Phone (optional)" />
      <textarea
        className="min-h-28 rounded border border-slate-300 px-3 py-2"
        name="message"
        placeholder={messageHint ? `Message (${messageHint})` : "Message"}
        required
      />
      <input type="hidden" name="source" value={initialSource} />
      <input type="hidden" name="course" value={initialCourse} />
      <input type="hidden" name="city" value={initialCity} />
      <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={state.loading}>
        {state.loading ? "Submitting..." : "Submit"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
