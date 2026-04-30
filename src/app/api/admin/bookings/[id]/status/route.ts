import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }
  const body = (await request.json()) as { status?: BookingStatus };
  if (!body.status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }
  await db.booking.update({
    where: { id: bookingId },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true });
}
