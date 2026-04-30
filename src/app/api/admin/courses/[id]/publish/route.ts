import { NextRequest, NextResponse } from "next/server";
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
    key: `admin-courses-publish:${ip}`,
    maxRequests: 40,
    windowMs: 60_000,
  });
  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }
  const body = (await request.json()) as { isPublished?: boolean };
  if (typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "Missing isPublished" }, { status: 400 });
  }
  await db.course.update({
    where: { id: courseId },
    data: { isPublished: body.isPublished },
  });
  return NextResponse.json({ ok: true });
}
