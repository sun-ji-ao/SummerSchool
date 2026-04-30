import { NextRequest, NextResponse } from "next/server";
import { BookingType } from "@prisma/client";
import { createBooking } from "@/server/services/booking-service";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const blocked = isRateLimited({
    key: `bookings:${ip}`,
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as {
    type?: BookingType;
    userEmail?: string;
    userName?: string;
    courseId?: number;
    amountExpected?: number;
    currency?: string;
    payload?: unknown;
  };
  if (!body.type || !body.userEmail) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const booking = await createBooking({
    type: body.type,
    userEmail: body.userEmail,
    userName: body.userName,
    courseId: body.courseId,
    amountExpected: body.amountExpected,
    currency: body.currency,
    payload: body.payload,
  });
  return NextResponse.json({ ok: true, channel: "bookings", id: booking.id }, { status: 201 });
}
