"use client";

import { FormEvent, useState } from "react";

type SubmitState = {
  loading: boolean;
  success?: string;
  error?: string;
};

export function BookingEnquiryClient() {
  const [state, setState] = useState<SubmitState>({ loading: false });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/booking-enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentName: String(form.get("parentName") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim() || undefined,
        studentAge: Number(form.get("studentAge") ?? "0") || undefined,
        preferredLocations: String(form.get("preferredLocations") ?? "").trim() || undefined,
        preferredCourses: String(form.get("preferredCourses") ?? "").trim() || undefined,
        intendedWindow: String(form.get("intendedWindow") ?? "").trim() || undefined,
        message: String(form.get("message") ?? "").trim() || undefined,
        source: "booking-enquiry-page",
      }),
    });
    const result = (await response.json()) as { id?: number; error?: string };
    if (!response.ok) {
      setState({ loading: false, error: result.error ?? "Submit failed" });
      return;
    }
    setState({ loading: false, success: `Enquiry submitted (#${result.id ?? "-"})` });
    event.currentTarget.reset();
  }

  return (
    <form className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6" onSubmit={handleSubmit}>
      <input className="rounded border border-slate-300 px-3 py-2" name="parentName" placeholder="Parent name" required />
      <input className="rounded border border-slate-300 px-3 py-2" name="email" placeholder="Email" type="email" required />
      <input className="rounded border border-slate-300 px-3 py-2" name="phone" placeholder="Phone (optional)" />
      <input className="rounded border border-slate-300 px-3 py-2" name="studentAge" placeholder="Student age" type="number" />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        name="preferredLocations"
        placeholder="Preferred locations (e.g. London, Oxford)"
      />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        name="preferredCourses"
        placeholder="Preferred courses (e.g. English Plus)"
      />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        name="intendedWindow"
        placeholder="Intended time window (e.g. July-August)"
      />
      <textarea className="min-h-28 rounded border border-slate-300 px-3 py-2" name="message" placeholder="Message" />
      <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={state.loading}>
        {state.loading ? "Submitting..." : "Submit Enquiry"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
