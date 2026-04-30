import { NextRequest, NextResponse } from "next/server";
import { createContact } from "@/server/services/lead-service";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const blocked = isRateLimited({
    key: `contact:${ip}`,
    maxRequests: 8,
    windowMs: 60_000,
  });
  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: string;
  };
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const contact = await createContact({
    name: body.name,
    email: body.email,
    phone: body.phone,
    message: body.message,
    source: body.source ?? "contact-form",
  });
  return NextResponse.json({ ok: true, channel: "contacts", id: contact.id }, { status: 201 });
}
