"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { initializeTransaction, PLANS, type PlanKey } from "@/lib/paystack";

export type PayState = { error: string | null };

export async function startPayment(
  _prev: PayState,
  formData: FormData
): Promise<PayState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const plan = String(formData.get("plan") ?? "full") as PlanKey;

  if (!fullName || !email) {
    return { error: "Enter your name and email to continue." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!(plan in PLANS)) {
    return { error: "Choose a payment option." };
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "lms.avzdax.com";
  const protocol = host.includes("localhost") ? "http" : "https";
  const callbackUrl = `${protocol}://${host}/pay/success`;

  const result = await initializeTransaction({
    email,
    amountKobo: PLANS[plan].amountKobo,
    callbackUrl,
    metadata: { full_name: fullName, plan, plan_label: PLANS[plan].label },
  });

  if (!result.status || !result.data) {
    return { error: "We couldn't reach Paystack. Please try again." };
  }

  redirect(result.data.authorization_url);
}
