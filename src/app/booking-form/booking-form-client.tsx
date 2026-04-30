"use client";

import { FormEvent, useState } from "react";

type SubmitState = {
  loading: boolean;
  error?: string;
  bookingId?: number;
  checkoutUrl?: string;
};

export function BookingFormClient() {
  const [state, setState] = useState<SubmitState>({ loading: false });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const userName = String(form.get("userName") ?? "").trim();
    const userEmail = String(form.get("userEmail") ?? "").trim();
    const amount = Number(form.get("amount") ?? "0");
    try {
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SUMMER",
          userName,
          userEmail,
          amountExpected: amount,
          currency: "GBP",
          payload: { source: "booking-form-ui" },
        }),
      });
      const bookingJson = (await bookingResponse.json()) as { id?: number; error?: string };
      if (!bookingResponse.ok || !bookingJson.id) {
        throw new Error(bookingJson.error ?? "Failed to create booking");
      }
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingJson.id,
          amount,
          currency: "GBP",
        }),
      });
      const checkoutJson = (await checkoutResponse.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!checkoutResponse.ok || !checkoutJson.checkoutUrl) {
        throw new Error(checkoutJson.error ?? "Failed to create checkout session");
      }
      setState({
        loading: false,
        bookingId: bookingJson.id,
        checkoutUrl: checkoutJson.checkoutUrl,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 p-6">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          name="userName"
          placeholder="Parent name"
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          name="userEmail"
          placeholder="Parent email"
          type="email"
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          name="amount"
          placeholder="Deposit amount (pence)"
          type="number"
          defaultValue={50000}
          min={100}
          required
        />
        <button
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          disabled={state.loading}
        >
          {state.loading ? "Submitting..." : "Create Booking & Checkout"}
        </button>
      </form>
      {state.error ? <p className="mt-4 text-sm text-red-600">{state.error}</p> : null}
      {state.bookingId ? (
        <p className="mt-4 text-sm text-slate-700">Booking created: #{state.bookingId}</p>
      ) : null}
      {state.checkoutUrl ? (
        <a
          className="mt-3 inline-block text-sm font-medium text-blue-700 underline"
          href={state.checkoutUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open Stripe Checkout
        </a>
      ) : null}
    </div>
  );
}
