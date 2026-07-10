import { createAdminClient } from "@/lib/supabase/admin";
import { adminIds, notify } from "@/lib/notify";

type PaymentRecord = {
  reference: string;
  email: string;
  fullName: string | null;
  plan: string | null;
  amountNaira: number;
  paidAt: string;
};

export async function recordPayment(payment: PaymentRecord) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("reference", payment.reference)
    .maybeSingle();

  await admin.from("payments").upsert(
    {
      reference: payment.reference,
      email: payment.email,
      full_name: payment.fullName,
      plan: payment.plan,
      amount_naira: payment.amountNaira,
      status: "success",
      paid_at: payment.paidAt,
    },
    { onConflict: "reference" }
  );

  if (existing) return;

  const planLabels: Record<string, string> = {
    full: "full payment",
    deposit: "deposit",
    consideration: "consideration fee",
  };
  const planLabel = planLabels[payment.plan ?? ""] ?? "payment";
  await notify({
    recipientIds: await adminIds(),
    title: "Payment received",
    body: `${payment.fullName ?? payment.email} paid ₦${payment.amountNaira.toLocaleString()} (${planLabel})`,
    href: "/admin/payments",
  });
}
