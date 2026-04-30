import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  if (!body?.type || !body?.userEmail) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, channel: "bookings", data: body }, { status: 201 });
}
