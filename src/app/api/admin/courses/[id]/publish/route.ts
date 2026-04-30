import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
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
