import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, channel: "contacts", data: body }, { status: 201 });
}
