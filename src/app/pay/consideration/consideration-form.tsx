"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { startPayment, type PayState } from "../actions";

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

export function ConsiderationForm() {
  const [state, formAction] = useActionState<PayState, FormData>(startPayment, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="plan" value="consideration" />

      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required />
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
