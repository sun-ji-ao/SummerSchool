import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { handleCheckoutCompleted, handleCheckoutExpired } from "@/server/services/payment-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  if (!signature || rawBody.length === 0) {
    return NextResponse.json({ error: "Missing webhook signature or payload" }, { status: 400 });
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }
  const stripe = getStripeClient();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object, event.id);
  }
  if (event.type === "checkout.session.expired") {
    await handleCheckoutExpired(event.data.object, event.id);
  }
  return NextResponse.json({ ok: true, type: event.type });
}
