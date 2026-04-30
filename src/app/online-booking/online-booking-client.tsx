"use client";

import { FormEvent, useState } from "react";

type SubmitState = {
  loading: boolean;
  success?: string;
  error?: string;
};

export function OnlineBookingClient() {
  const [state, setState] = useState<SubmitState>({ loading: false });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const userName = String(form.get("userName") ?? "").trim();
    const userEmail = String(form.get("userEmail") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const preferredSchedule = String(form.get("preferredSchedule") ?? "").trim();
    const amount = Number(form.get("amount") ?? "0");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ONLINE_TUTORING",
        userName,
        userEmail,
        amountExpected: amount > 0 ? amount : undefined,
        currency: "GBP",
        payload: {
          source: "online-booking-page",
          subject,
          preferredSchedule,
        },
      }),
    });
    const result = (await response.json()) as { id?: number; error?: string };
    if (!response.ok) {
      setState({ loading: false, error: result.error ?? "Submit failed" });
      return;
    }
    setState({ loading: false, success: `Online booking submitted (#${result.id ?? "-"})` });
    event.currentTarget.reset();
  }

  return (
    <form className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6" onSubmit={handleSubmit}>
      <input className="rounded border border-slate-300 px-3 py-2" name="userName" placeholder="Parent name" required />
      <input className="rounded border border-slate-300 px-3 py-2" name="userEmail" placeholder="Email" type="email" required />
      <input className="rounded border border-slate-300 px-3 py-2" name="subject" placeholder="Tutoring subject (e.g. IELTS)" required />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        name="preferredSchedule"
        placeholder="Preferred schedule (e.g. Tue/Thu evening)"
        required
      />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        name="amount"
        placeholder="Optional budget (pence)"
        type="number"
        min={0}
      />
      <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={state.loading}>
        {state.loading ? "Submitting..." : "Submit Online Booking"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
