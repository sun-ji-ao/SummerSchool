import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateSameOrigin } from "@/lib/csrf";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateTestimonialBody = {
  studentName?: string;
  country?: string;
  content?: string;
  programName?: string;
  displayOrder?: number;
  isPublished?: boolean;
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
  if (isRateLimited({ key: `admin-testimonials-update:${ip}`, maxRequests: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const testimonialId = Number(id);
  if (!Number.isFinite(testimonialId)) {
    return NextResponse.json({ error: "Invalid testimonial id" }, { status: 400 });
  }
  const body = (await request.json()) as UpdateTestimonialBody;
  if (!body.studentName?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Missing required fields: studentName/content" }, { status: 400 });
  }
  await db.testimonial.update({
    where: { id: testimonialId },
    data: {
      studentName: body.studentName.trim(),
      country: body.country?.trim() || null,
      content: body.content.trim(),
      programName: body.programName?.trim() || null,
      displayOrder: Number.isFinite(body.displayOrder) ? Math.round(body.displayOrder ?? 0) : 0,
      isPublished: Boolean(body.isPublished),
    },
  });
  return NextResponse.json({ ok: true });
}

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
  if (isRateLimited({ key: `admin-testimonials-delete:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const testimonialId = Number(id);
  if (!Number.isFinite(testimonialId)) {
    return NextResponse.json({ error: "Invalid testimonial id" }, { status: 400 });
  }
  await db.testimonial.delete({ where: { id: testimonialId } });
  return NextResponse.json({ ok: true });
}
