import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

type CreateTestimonialBody = {
  studentName?: string;
  country?: string;
  content?: string;
  programName?: string;
  displayOrder?: number;
  isPublished?: boolean;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-testimonials-create:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as CreateTestimonialBody;
  if (!body.studentName?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Missing required fields: studentName/content" }, { status: 400 });
  }
  const created = await db.testimonial.create({
    data: {
      studentName: body.studentName.trim(),
      country: body.country?.trim() || null,
      content: body.content.trim(),
      programName: body.programName?.trim() || null,
      displayOrder: Number.isFinite(body.displayOrder) ? Math.round(body.displayOrder ?? 0) : 0,
      isPublished: Boolean(body.isPublished),
    },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
