import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { assertBookingStatusTransition } from "@/server/domain/booking-state-machine";
import { sendDepositPaidEmail } from "@/server/services/mailer-service";

type CheckoutInput = {
  bookingId: number;
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
};

export async function createCheckoutSession(input: CheckoutInput): Promise<Stripe.Checkout.Session> {
  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  assertBookingStatusTransition(booking.status, "AWAITING_DEPOSIT");
  const stripe = getStripeClient();
  const currency = (input.currency ?? booking.currency ?? "GBP").toLowerCase();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: booking.userEmail,
    metadata: {
      bookingId: String(booking.id),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: input.amount,
          product_data: {
            name: `SummerSchool deposit #${booking.id}`,
          },
        },
      },
    ],
  });
  await db.payment.create({
    data: {
      bookingId: booking.id,
      amount: input.amount,
      currency: currency.toUpperCase(),
      status: "PENDING",
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    },
  });
  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: "AWAITING_DEPOSIT",
    },
  });
  return session;
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  const bookingIdText = session.metadata?.bookingId;
  const bookingId = bookingIdText ? Number(bookingIdText) : NaN;
  if (!Number.isFinite(bookingId)) {
    return;
  }
  let shouldNotify = false;
  await db.$transaction(async (tx) => {
    const existingEvent = await tx.payment.findFirst({
      where: { stripeEventId: eventId },
      select: { id: true },
    });
    if (existingEvent) {
      return;
    }
    await tx.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: "SUCCEEDED",
        stripeEventId: eventId,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      },
    });
    const currentBooking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: { status: true },
    });
    if (currentBooking) {
      assertBookingStatusTransition(currentBooking.status, "DEPOSIT_PAID");
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "DEPOSIT_PAID" },
      });
      shouldNotify = true;
    }
  });
  if (shouldNotify) {
    const paidBooking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userEmail: true,
        userName: true,
        type: true,
        amountExpected: true,
        currency: true,
      },
    });
    if (!paidBooking) {
      return;
    }
    try {
      await sendDepositPaidEmail({
        bookingId: paidBooking.id,
        userEmail: paidBooking.userEmail,
        userName: paidBooking.userName,
        bookingType: paidBooking.type,
        amountExpected: paidBooking.amountExpected,
        currency: paidBooking.currency,
      });
    } catch (error) {
      console.error("Failed to send deposit paid email:", error);
    }
  }
}

export async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  await db.payment.updateMany({
    where: { stripeSessionId: session.id, stripeEventId: null },
    data: {
      status: "EXPIRED",
      stripeEventId: eventId,
    },
  });
}
