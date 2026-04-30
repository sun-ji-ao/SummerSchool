import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/server/services/payment-service";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const blocked = isRateLimited({
    key: `checkout:${ip}`,
    maxRequests: 12,
    windowMs: 60_000,
  });
  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as {
    bookingId?: number;
    amount?: number;
    currency?: string;
    successUrl?: string;
    cancelUrl?: string;
  };
  if (!body?.bookingId || !body?.amount) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY." },
      { status: 500 },
    );
  }
  const origin = request.nextUrl.origin;
  const session = await createCheckoutSession({
    bookingId: body.bookingId,
    amount: body.amount,
    currency: body.currency,
    successUrl: body.successUrl ?? `${origin}/cart?checkout=success`,
    cancelUrl: body.cancelUrl ?? `${origin}/cart?checkout=cancel`,
  });
  return NextResponse.json(
    { ok: true, checkoutUrl: session.url, bookingId: body.bookingId, sessionId: session.id },
    { status: 201 },
  );
}
