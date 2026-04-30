import { NextRequest, NextResponse } from "next/server";
import { BookingEnquiryStatus } from "@prisma/client";
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
  if (isRateLimited({ key: `admin-export-enquiries:${ip}`, maxRequests: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() as BookingEnquiryStatus | "";
  const where = {
    ...(q
      ? {
          OR: [
            { parentName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };
  const enquiries = await db.bookingEnquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv([
    ["id", "parent_name", "email", "phone", "student_age", "preferred_locations", "preferred_courses", "status", "source", "created_at"],
    ...enquiries.map((enquiry) => [
      enquiry.id,
      enquiry.parentName,
      enquiry.email,
      enquiry.phone ?? "",
      enquiry.studentAge ?? "",
      enquiry.preferredLocations ?? "",
      enquiry.preferredCourses ?? "",
      enquiry.status,
      enquiry.source ?? "",
      enquiry.createdAt.toISOString(),
    ]),
  ]);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${Date.now()}.csv"`,
    },
  });
}
