import { NextRequest, NextResponse } from "next/server";
import { BookingEnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateSameOrigin } from "@/lib/csrf";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const csrfRejected = validateSameOrigin(request);
  if (csrfRejected) {
    return csrfRejected;
  }
  const ip = getClientIp(request.headers);
  const blocked = isRateLimited({
    key: `admin-enquiries-status:${ip}`,
    maxRequests: 40,
    windowMs: 60_000,
  });
  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const enquiryId = Number(id);
  if (!Number.isFinite(enquiryId)) {
    return NextResponse.json({ error: "Invalid enquiry id" }, { status: 400 });
  }
  const body = (await request.json()) as { status?: BookingEnquiryStatus };
  if (!body.status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }
  await db.bookingEnquiry.update({
    where: { id: enquiryId },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true });
}
