import { NextRequest, NextResponse } from "next/server";
import { createBookingEnquiry } from "@/server/services/lead-service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as {
    parentName?: string;
    email?: string;
    phone?: string;
    studentAge?: number;
    preferredLocations?: string;
    preferredCourses?: string;
    intendedWindow?: string;
    message?: string;
    source?: string;
  };
  if (!body.parentName || !body.email) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const enquiry = await createBookingEnquiry({
    parentName: body.parentName,
    email: body.email,
    phone: body.phone,
    studentAge: body.studentAge,
    preferredLocations: body.preferredLocations,
    preferredCourses: body.preferredCourses,
    intendedWindow: body.intendedWindow,
    message: body.message,
    source: body.source ?? "booking-enquiry-form",
  });
  return NextResponse.json({ ok: true, channel: "booking_enquiries", id: enquiry.id }, { status: 201 });
}
