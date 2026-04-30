import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-export-payments:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { booking: true },
  });
  const csv = toCsv([
    ["id", "booking_id", "booking_email", "amount", "currency", "status", "stripe_session_id", "stripe_payment_intent_id", "created_at"],
    ...payments.map((payment) => [
      payment.id,
      payment.bookingId,
      payment.booking.userEmail,
      payment.amount,
      payment.currency,
      payment.status,
      payment.stripeSessionId ?? "",
      payment.stripePaymentIntentId ?? "",
      payment.createdAt.toISOString(),
    ]),
  ]);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payments-${Date.now()}.csv"`,
    },
  });
}
