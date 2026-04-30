"use client";

import { FormEvent, useState } from "react";

type SubmitState = {
  loading: boolean;
  error?: string;
  bookingId?: number;
  checkoutUrl?: string;
};

type BookingFormClientProps = {
  preselectedCourse: {
    id: number;
    slug: string;
    title: string;
    categoryName: string;
    city: string;
    price: number | null;
    currency: string;
  } | null;
};

export function BookingFormClient({ preselectedCourse }: BookingFormClientProps) {
  const [state, setState] = useState<SubmitState>({ loading: false });
  const defaultAmountPence =
    preselectedCourse?.price && preselectedCourse.price > 0
      ? Math.max(10_000, Math.min(100_000, Math.round(preselectedCourse.price * 100 * 0.2)))
      : 50_000;
  const bookingCurrency = preselectedCourse?.currency ?? "GBP";

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
          courseId: preselectedCourse?.id,
          amountExpected: amount,
          currency: bookingCurrency,
          payload: {
            source: "booking-form-ui",
            courseSlug: preselectedCourse?.slug ?? null,
          },
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
          currency: bookingCurrency,
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
      {preselectedCourse ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-medium">Selected course: {preselectedCourse.title}</p>
          <p>
            {preselectedCourse.categoryName} | {preselectedCourse.city}
          </p>
          {preselectedCourse.price ? (
            <p>
              Suggested deposit: {bookingCurrency} {(defaultAmountPence / 100).toFixed(0)} (20% of course fee)
            </p>
          ) : null}
        </div>
      ) : null}
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
          defaultValue={defaultAmountPence}
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
