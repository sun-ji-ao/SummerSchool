import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { importCoursesFromCsv } from "@/server/services/course-import-service";

type ImportRequestBody = {
  csv?: string;
  mode?: "upsert" | "createOnly";
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauthorized = await requireAdminSession();
  if (unauthorized) {
    return unauthorized;
  }
  const ip = getClientIp(request.headers);
  if (isRateLimited({ key: `admin-courses-import:${ip}`, maxRequests: 8, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json()) as ImportRequestBody;
  if (!body.csv?.trim()) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }
  const result = await importCoursesFromCsv(db, body.csv, body.mode ?? "upsert");
  return NextResponse.json(result);
}
