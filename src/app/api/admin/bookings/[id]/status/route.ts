import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  const blocked = isRateLimited({
    key: `admin-bookings-status:${ip}`,
    maxRequests: 40,
    windowMs: 60_000,
  });
  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }
  const body = (await request.json()) as { status?: BookingStatus };
  if (!body.status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }
  await db.booking.update({
    where: { id: bookingId },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true });
}
