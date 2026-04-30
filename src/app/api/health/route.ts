import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type ServiceStatus = "ok" | "warn" | "error";

type HealthPayload = {
  ok: boolean;
  timestamp: string;
  services: {
    database: { status: ServiceStatus; detail: string };
    stripe: { status: ServiceStatus; detail: string };
    mail: { status: ServiceStatus; detail: string };
  };
};

export async function GET(): Promise<NextResponse<HealthPayload>> {
  let databaseStatus: HealthPayload["services"]["database"] = {
    status: "ok",
    detail: "connected",
  };
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    databaseStatus = {
      status: "error",
      detail: "unreachable",
    };
  }

  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const stripeStatus: HealthPayload["services"]["stripe"] = hasStripe
    ? { status: "ok", detail: "configured" }
    : { status: "warn", detail: "missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" };

  const hasMail = Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
  const mailStatus: HealthPayload["services"]["mail"] = hasMail
    ? { status: "ok", detail: "configured" }
    : { status: "warn", detail: "missing RESEND_API_KEY or MAIL_FROM" };

  const ok = databaseStatus.status !== "error";
  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        stripe: stripeStatus,
        mail: mailStatus,
      },
    },
    { status: ok ? 200 : 503 },
  );
}
