import { NextRequest, NextResponse } from "next/server";
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
  if (isRateLimited({ key: `admin-testimonials-publish:${ip}`, maxRequests: 40, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const testimonialId = Number(id);
  if (!Number.isFinite(testimonialId)) {
    return NextResponse.json({ error: "Invalid testimonial id" }, { status: 400 });
  }
  const body = (await request.json()) as { isPublished?: boolean };
  if (typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "Missing isPublished" }, { status: 400 });
  }
  await db.testimonial.update({
    where: { id: testimonialId },
    data: { isPublished: body.isPublished },
  });
  return NextResponse.json({ ok: true });
}
