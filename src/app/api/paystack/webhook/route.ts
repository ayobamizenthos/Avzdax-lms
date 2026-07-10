import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { recordPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const data = event.data;
    await recordPayment({
      reference: data.reference,
      email: data.customer?.email ?? "",
      fullName: data.metadata?.full_name ?? null,
      plan: data.metadata?.plan ?? null,
      amountNaira: data.amount / 100,
      paidAt: data.paid_at ?? new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
