import { createAdminClient } from "@/lib/supabase/admin";

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
}
