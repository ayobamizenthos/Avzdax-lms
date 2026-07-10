"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { startPayment, type PayState } from "./actions";

type PlanKey = "full" | "deposit";

const plans: {
  key: PlanKey;
  title: string;
  amount: string;
  detail: string;
}[] = [
  {
    key: "full",
    title: "Full payment",
    amount: "₦65,000",
    detail: "Pay the full academy fee once and you're set.",
  },
  {
    key: "deposit",
    title: "Commitment deposit",
    amount: "₦25,000",
    detail: "Secure your seat now, pay the ₦40,000 balance before classes begin.",
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          Continue to payment
          <ArrowRight className="size-4" />
        </>
      )}
    </Button>
  );
}

export function PayForm() {
  const [plan, setPlan] = useState<PlanKey>("full");
  const [state, formAction] = useActionState<PayState, FormData>(startPayment, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="plan" value={plan} />

      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((option) => {
          const active = plan === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setPlan(option.key)}
              className={cn(
                "rounded-lg border p-5 text-left transition-colors",
                active
                  ? "border-brand bg-brand-tint"
                  : "border-line-strong hover:border-ink/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-soft">
                  {option.title}
                </span>
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full border",
                    active
                      ? "border-brand bg-brand text-brand-ink"
                      : "border-line-strong"
                  )}
                >
                  {active ? <Check className="size-3.5" /> : null}
                </span>
              </div>
              <p className="mt-2 font-display text-2xl text-ink">{option.amount}</p>
              <p className="mt-1 text-sm text-muted">{option.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" required />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-sm border border-danger/20 bg-danger-tint px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="size-3.5" />
        Payments are securely processed by Paystack.
      </p>
    </form>
  );
}
