import { BookingStatus } from "@prisma/client";
import { assertBookingStatusTransition, canTransitionBookingStatus } from "../src/server/domain/booking-state-machine";

function expectTrue(value: boolean, message: string): void {
  if (!value) {
    throw new Error(message);
  }
}

function expectThrows(run: () => void, message: string): void {
  try {
    run();
  } catch {
    return;
  }
  throw new Error(message);
}

function runTests(): void {
  const okCases: Array<[BookingStatus, BookingStatus]> = [
    ["DRAFT", "SUBMITTED"],
    ["SUBMITTED", "AWAITING_DEPOSIT"],
    ["AWAITING_DEPOSIT", "DEPOSIT_PAID"],
    ["DEPOSIT_PAID", "CONFIRMED"],
    ["CONFIRMED", "CANCELLED"],
  ];
  for (const [from, to] of okCases) {
    expectTrue(canTransitionBookingStatus(from, to), `Expected allowed: ${from} -> ${to}`);
    assertBookingStatusTransition(from, to);
  }

  const rejectCases: Array<[BookingStatus, BookingStatus]> = [
    ["DRAFT", "CONFIRMED"],
    ["SUBMITTED", "DEPOSIT_PAID"],
    ["CANCELLED", "DRAFT"],
  ];
  for (const [from, to] of rejectCases) {
    expectTrue(!canTransitionBookingStatus(from, to), `Expected rejected: ${from} -> ${to}`);
    expectThrows(() => assertBookingStatusTransition(from, to), `Expected throw: ${from} -> ${to}`);
  }

  console.log("Booking state machine tests passed.");
}

runTests();
