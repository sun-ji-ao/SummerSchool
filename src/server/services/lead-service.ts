import { db } from "@/lib/db";

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
};

export type BookingEnquiryInput = {
  parentName: string;
  email: string;
  phone?: string;
  studentAge?: number;
  preferredLocations?: string;
  preferredCourses?: string;
  intendedWindow?: string;
  message?: string;
  source?: string;
};

export async function createContact(input: ContactInput) {
  return db.contact.create({
    data: input,
  });
}

export async function createBookingEnquiry(input: BookingEnquiryInput) {
  return db.bookingEnquiry.create({
    data: input,
  });
}
