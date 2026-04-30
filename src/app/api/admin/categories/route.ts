import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateSameOrigin } from "@/lib/csrf";

type CreateCategoryBody = {
  name?: string;
  slug?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const csrfRejected = validateSameOrigin(request);
  if (csrfRejected) {
    return csrfRejected;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-categories-create:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as CreateCategoryBody;
  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "Missing required fields: name/slug" }, { status: 400 });
  }
  try {
    const category = await db.category.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: category.id });
  } catch {
    return NextResponse.json({ error: "Create failed, maybe duplicate slug" }, { status: 400 });
  }
}
