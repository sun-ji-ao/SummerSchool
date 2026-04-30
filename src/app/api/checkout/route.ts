import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  if (!body?.bookingId || !body?.amount) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  return NextResponse.json(
    { ok: true, checkoutUrl: "/cart?checkout=mock", bookingId: body.bookingId },
    { status: 201 },
  );
}
