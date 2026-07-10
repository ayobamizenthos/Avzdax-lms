import type { Metadata } from "next";
import { Banknote, Users, Wallet } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard } from "@/components/app/page-header";
import { PaymentsDirectory } from "@/components/admin/payments-directory";

export const metadata: Metadata = {
  title: "Payments",
};

export default async function AdminPaymentsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, reference, email, full_name, plan, amount_naira, paid_at")
    .order("paid_at", { ascending: false });

  const rows = payments ?? [];
  const totalCollected = rows.reduce((sum, row) => sum + row.amount_naira, 0);
  const fullCount = rows.filter((row) => row.plan === "full").length;
  const depositCount = rows.filter((row) => row.plan === "deposit").length;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Every academy fee payment, with who paid, how much and which option."
      />

      <div className="mb-6 grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Total collected"
          value={`₦${totalCollected.toLocaleString()}`}
          sublabel={`${rows.length} payments`}
          icon={<Banknote className="size-5" strokeWidth={1.9} />}
        />
        <StatCard
          label="Full payments"
          value={fullCount}
          sublabel="Paid in full"
          icon={<Wallet className="size-5" strokeWidth={1.9} />}
        />
        <StatCard
          label="Deposits"
          value={depositCount}
          sublabel="Balance due before classes"
          icon={<Users className="size-5" strokeWidth={1.9} />}
        />
      </div>

      <PaymentsDirectory payments={rows} />
    </div>
  );
}
