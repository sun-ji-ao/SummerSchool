import { NextRequest, NextResponse } from "next/server";

function normalizeOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin.toLowerCase();
  } catch {
    return "";
  }
}

export function validateSameOrigin(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return null;
  }
  const origin = request.headers.get("origin");
  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 403 });
  }
  const requestOrigin = normalizeOrigin(origin);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const expectedOrigin = host ? `${protocol}://${host}`.toLowerCase() : "";
  if (!expectedOrigin || requestOrigin !== expectedOrigin) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }
  return null;
}
