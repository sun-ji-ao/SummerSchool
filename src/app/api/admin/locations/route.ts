import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateSameOrigin } from "@/lib/csrf";

type CreateLocationBody = {
  name?: string;
  slug?: string;
  city?: string;
  description?: string;
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
  if (isRateLimited({ key: `admin-locations-create:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as CreateLocationBody;
  if (!body.name?.trim() || !body.slug?.trim() || !body.city?.trim()) {
    return NextResponse.json({ error: "Missing required fields: name/slug/city" }, { status: 400 });
  }
  try {
    const location = await db.location.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        city: body.city.trim(),
        description: body.description?.trim() || null,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: location.id });
  } catch {
    return NextResponse.json({ error: "Create failed, maybe duplicate slug" }, { status: 400 });
  }
}
