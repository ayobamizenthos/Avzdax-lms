"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Wallet } from "lucide-react";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type Payment = {
  id: string;
  reference: string;
  email: string;
  full_name: string | null;
  plan: string | null;
  amount_naira: number;
  paid_at: string;
};

const filters: { value: "all" | "full" | "deposit"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "full", label: "Full payment" },
  { value: "deposit", label: "Deposit" },
];

export function PaymentsDirectory({ payments }: { payments: Payment[] }) {
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<"all" | "full" | "deposit">("all");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return payments.filter((payment) => {
      if (plan !== "all" && payment.plan !== plan) return false;
      if (!term) return true;
      return (
        (payment.full_name ?? "").toLowerCase().includes(term) ||
        payment.email.toLowerCase().includes(term) ||
        payment.reference.toLowerCase().includes(term)
      );
    });
  }, [payments, query, plan]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email or reference"
            className="pl-10"
          />
        </div>
        <div className="inline-flex rounded-sm bg-paper p-1">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPlan(option.value)}
              className={cn(
                "rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors",
                plan === option.value
                  ? "bg-surface text-ink shadow-card"
                  : "text-muted hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments yet"
          description="Payments will appear here as candidates pay their academy fee."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-5 py-3 font-medium">Option</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Paid</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {results.map((payment) => (
                  <tr key={payment.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">
                        {payment.full_name ?? "Candidate"}
                      </p>
                      <p className="text-xs text-muted">{payment.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      {payment.plan === "deposit" ? (
                        <Badge tone="gold">Deposit</Badge>
                      ) : (
                        <Badge tone="brand">Full payment</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-ink">
                      ₦{payment.amount_naira.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {format(new Date(payment.paid_at), "MMM d, yyyy · h:mm a")}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">
                      {payment.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
