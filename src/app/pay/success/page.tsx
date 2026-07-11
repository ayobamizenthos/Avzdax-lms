import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { verifyTransaction } from "@/lib/paystack";
import { recordPayment } from "@/lib/payments";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = {
  title: "Payment status",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  let success = false;
  let amountNaira = 0;
  let planLabel = "";
  let email = "";

  if (reference) {
    const result = await verifyTransaction(reference);
    if (result.status && result.data?.status === "success") {
      success = true;
      amountNaira = result.data.amount / 100;
      email = result.data.customer.email;
      planLabel = String(result.data.metadata?.plan_label ?? "");

      await recordPayment({
        reference: result.data.reference,
        email,
        fullName: (result.data.metadata?.full_name as string) ?? null,
        plan: (result.data.metadata?.plan as string) ?? null,
        amountNaira,
        paidAt: new Date().toISOString(),
      });
    }
  }

  const balanceDue = success && amountNaira === 25000;

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-5 py-12">
      <div className="w-full max-w-md animate-rise">
        <div className="mb-8 flex justify-start sm:justify-center">
          <div className="sm:hidden">
            <Wordmark size="sm" />
          </div>
          <div className="hidden sm:block">
            <Wordmark />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-8 text-center shadow-card">
          {success ? (
            <>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-tint text-brand">
                <CheckCircle2 className="size-9" strokeWidth={1.75} />
              </span>
              <h1 className="mt-5 font-display text-2xl text-ink">Payment received</h1>
              <p className="mt-2 text-ink-soft">
                Thank you. We&rsquo;ve received your {planLabel.toLowerCase()} of{" "}
                <span className="font-semibold text-ink">
                  ₦{amountNaira.toLocaleString()}
                </span>
                .
              </p>
              {balanceDue ? (
                <p className="mt-3 rounded-sm bg-gold-tint px-4 py-2.5 text-sm text-gold">
                  Your ₦40,000 balance is due before classes begin. We&rsquo;ll
                  send you a reminder.
                </p>
              ) : null}
              <p className="mt-4 text-sm text-muted">
                A confirmation and your login details will be sent to{" "}
                <span className="font-medium text-ink">{email}</span>.
              </p>
              {reference ? (
                <p className="mt-4 text-xs text-muted">Reference: {reference}</p>
              ) : null}
            </>
          ) : (
            <>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-danger-tint text-danger">
                <XCircle className="size-9" strokeWidth={1.75} />
              </span>
              <h1 className="mt-5 font-display text-2xl text-ink">
                Payment not confirmed
              </h1>
              <p className="mt-2 text-ink-soft">
                We couldn&rsquo;t confirm this payment. If money left your account,
                it will be reversed automatically.
              </p>
              <Link
                href="/pay"
                className="mt-5 inline-block font-medium text-brand hover:underline"
              >
                Try again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
