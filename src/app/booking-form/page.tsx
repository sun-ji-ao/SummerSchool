import { BookingFormClient } from "./booking-form-client";

export default function BookingFormPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Course Booking</h1>
      <p className="mt-2 text-slate-600">用于线下暑校预订（type=SUMMER）并跳转 Stripe 支付定金。</p>
      <BookingFormClient />
    </main>
  );
}
