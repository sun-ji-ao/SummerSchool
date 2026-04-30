import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  if (!body?.parentName || !body?.email) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, channel: "booking_enquiries", data: body }, { status: 201 });
}
