import { OnlineBookingClient } from "./online-booking-client";

export default function OnlineBookingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Online Tutoring Booking</h1>
      <p className="mt-2 text-slate-600">用于线上辅导预订（type=ONLINE_TUTORING）。</p>
      <OnlineBookingClient />
    </main>
  );
}
