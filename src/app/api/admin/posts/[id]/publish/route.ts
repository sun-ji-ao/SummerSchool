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
  if (isRateLimited({ key: `admin-posts-publish:${ip}`, maxRequests: 40, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }
  const body = (await request.json()) as { isPublished?: boolean };
  if (typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "Missing isPublished" }, { status: 400 });
  }
  await db.post.update({
    where: { id: postId },
    data: { isPublished: body.isPublished },
  });
  return NextResponse.json({ ok: true });
}
