import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdatePostBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  isPublished?: boolean;
};

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-posts-update:${ip}`, maxRequests: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }
  const body = (await request.json()) as UpdatePostBody;
  if (!body.title?.trim() || !body.slug?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Missing required fields: title/slug/content" }, { status: 400 });
  }
  try {
    await db.post.update({
      where: { id: postId },
      data: {
        title: body.title.trim(),
        slug: body.slug.trim(),
        excerpt: body.excerpt?.trim() || null,
        content: body.content.trim(),
        coverImage: body.coverImage?.trim() || null,
        isPublished: Boolean(body.isPublished),
        publishedAt: body.isPublished ? new Date() : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Update failed, maybe duplicate slug" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-posts-delete:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }
  await db.post.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}
