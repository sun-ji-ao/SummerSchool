type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

function getMailFromAddress(): string {
  return process.env.MAIL_FROM ?? "SummerSchool-UK <noreply@summerschool-uk.com>";
}

async function sendMail(input: SendMailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[mailer] skip send (missing RESEND_API_KEY): to=${input.to} subject=${input.subject}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getMailFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Send mail failed: ${response.status} ${text}`);
  }
}

type BookingMailInput = {
  bookingId: number;
  userEmail: string;
  userName?: string | null;
  bookingType: string;
  amountExpected?: number | null;
  currency?: string | null;
};

export async function sendBookingSubmittedEmail(input: BookingMailInput): Promise<void> {
  const studentOrParent = input.userName?.trim() || "Parent";
  const amountText =
    input.amountExpected && input.amountExpected > 0
      ? `${input.amountExpected} ${input.currency ?? "GBP"}`
      : "TBD";
  await sendMail({
    to: input.userEmail,
    subject: `Booking submitted (#${input.bookingId})`,
    html: `
      <h2>Booking Submitted</h2>
      <p>Hello ${studentOrParent}, your booking request has been received.</p>
      <p><strong>Booking ID:</strong> #${input.bookingId}</p>
      <p><strong>Type:</strong> ${input.bookingType}</p>
      <p><strong>Expected Amount:</strong> ${amountText}</p>
      <p>We will notify you after the next status update.</p>
    `,
  });
}

export async function sendDepositPaidEmail(input: BookingMailInput): Promise<void> {
  const studentOrParent = input.userName?.trim() || "Parent";
  await sendMail({
    to: input.userEmail,
    subject: `Deposit received (#${input.bookingId})`,
    html: `
      <h2>Deposit Payment Received</h2>
      <p>Hello ${studentOrParent}, we have received your deposit payment.</p>
      <p><strong>Booking ID:</strong> #${input.bookingId}</p>
      <p>Your booking status has been updated to <strong>DEPOSIT_PAID</strong>.</p>
      <p>Our team will contact you with next steps shortly.</p>
    `,
  });
}
