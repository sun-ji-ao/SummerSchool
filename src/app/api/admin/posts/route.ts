import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

type CreatePostBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  isPublished?: boolean;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-posts-create:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as CreatePostBody;
  if (!body.title?.trim() || !body.slug?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Missing required fields: title/slug/content" }, { status: 400 });
  }
  try {
    const created = await db.post.create({
      data: {
        title: body.title.trim(),
        slug: body.slug.trim(),
        excerpt: body.excerpt?.trim() || null,
        content: body.content.trim(),
        coverImage: body.coverImage?.trim() || null,
        isPublished: Boolean(body.isPublished),
        publishedAt: body.isPublished ? new Date() : null,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch {
    return NextResponse.json({ error: "Create failed, maybe duplicate slug" }, { status: 400 });
  }
}
