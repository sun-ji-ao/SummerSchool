import { BookingStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ["SUBMITTED", "AWAITING_DEPOSIT", "CANCELLED"],
  SUBMITTED: ["AWAITING_DEPOSIT", "CANCELLED"],
  AWAITING_DEPOSIT: ["DEPOSIT_PAID", "CANCELLED"],
  DEPOSIT_PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

export function canTransitionBookingStatus(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) {
    return true;
  }
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertBookingStatusTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransitionBookingStatus(from, to)) {
    throw new Error(`Invalid booking status transition: ${from} -> ${to}`);
  }
}
