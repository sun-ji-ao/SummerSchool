import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateSameOrigin } from "@/lib/csrf";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const csrfRejected = validateSameOrigin(request);
  if (csrfRejected) {
    return csrfRejected;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-locations-delete:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const locationId = Number(id);
  if (!Number.isFinite(locationId)) {
    return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
  }
  const courseCount = await db.course.count({ where: { locationId } });
  if (courseCount > 0) {
    return NextResponse.json({ error: "Cannot delete location with linked courses" }, { status: 400 });
  }
  await db.location.delete({ where: { id: locationId } });
  return NextResponse.json({ ok: true });
}
