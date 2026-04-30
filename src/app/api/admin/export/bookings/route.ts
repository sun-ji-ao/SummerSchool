import { NextRequest, NextResponse } from "next/server";
import { BookingStatus, BookingType } from "@prisma/client";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-export-bookings:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() as BookingStatus | "";
  const type = request.nextUrl.searchParams.get("type")?.trim() as BookingType | "";
  const where = {
    ...(q
      ? {
          OR: [
            { userEmail: { contains: q, mode: "insensitive" as const } },
            { userName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };
  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 }, course: true },
  });
  const csv = toCsv([
    ["id", "email", "name", "type", "status", "course", "payment_status", "amount_expected", "currency", "created_at"],
    ...bookings.map((booking) => [
      booking.id,
      booking.userEmail,
      booking.userName,
      booking.type,
      booking.status,
      booking.course?.title ?? "",
      booking.payments[0]?.status ?? "",
      booking.amountExpected ?? "",
      booking.currency,
      booking.createdAt.toISOString(),
    ]),
  ]);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${Date.now()}.csv"`,
    },
  });
}
