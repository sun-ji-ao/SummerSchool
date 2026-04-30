import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  if (!signature || rawBody.length === 0) {
    return NextResponse.json({ error: "Missing webhook signature or payload" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
