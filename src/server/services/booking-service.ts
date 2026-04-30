import { BookingType } from "@prisma/client";
import { db } from "@/lib/db";

export type CreateBookingInput = {
  type: BookingType;
  userEmail: string;
  userName?: string;
  courseId?: number;
  amountExpected?: number;
  currency?: string;
  payload?: unknown;
};

export async function createBooking(input: CreateBookingInput) {
  return db.booking.create({
    data: {
      type: input.type,
      userEmail: input.userEmail,
      userName: input.userName,
      courseId: input.courseId,
      amountExpected: input.amountExpected,
      currency: input.currency ?? "GBP",
      payload: input.payload as object | undefined,
      status: "SUBMITTED",
    },
  });
}
