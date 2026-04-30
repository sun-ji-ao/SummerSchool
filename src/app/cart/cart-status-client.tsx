"use client";

import { FormEvent, useState } from "react";

type BookingStatusResponse = {
  ok?: boolean;
  error?: string;
  booking?: {
    id: number;
    status: string;
    userEmail: string;
    amountExpected: number | null;
    currency: string;
    course: { title: string } | null;
    payments: Array<{
      id: number;
      status: string;
      amount: number;
      currency: string;
      createdAt: string;
    }>;
  };
};

export function CartStatusClient() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BookingStatusResponse["booking"] | null>(null);

  async function handleQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    const response = await fetch(`/api/bookings/${bookingId.trim()}`);
    const result = (await response.json()) as BookingStatusResponse;
    if (!response.ok || !result.booking) {
      setError(result.error ?? "Query failed");
      setLoading(false);
      return;
    }
    setData(result.booking);
    setLoading(false);
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleQuery}>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Enter booking ID"
          value={bookingId}
          onChange={(event) => setBookingId(event.target.value)}
          required
        />
        <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {data ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <p>Booking: #{data.id}</p>
            <p>Status: {data.status}</p>
            <p>Email: {data.userEmail}</p>
            <p>Course: {data.course?.title ?? "N/A"}</p>
            <p>
              Expected Amount: {data.amountExpected ?? 0} {data.currency}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-sm font-semibold">Payments</h3>
            <div className="mt-2 space-y-2 text-sm">
              {data.payments.map((payment) => (
                <div key={payment.id} className="rounded border border-slate-100 p-2">
                  <p>
                    #{payment.id} | {payment.status}
                  </p>
                  <p>
                    {payment.amount} {payment.currency}
                  </p>
                </div>
              ))}
              {!data.payments.length ? <p className="text-slate-500">No payments yet.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
