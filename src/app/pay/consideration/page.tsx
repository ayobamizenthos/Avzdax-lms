import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { ConsiderationForm } from "./consideration-form";

export const metadata: Metadata = {
  title: "Consideration offer",
};

export default function ConsiderationPage() {
  return (
    <div className="min-h-dvh bg-paper px-5 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-lg animate-rise">
        <div className="mb-8 flex justify-start sm:justify-center">
          <div className="sm:hidden">
            <Wordmark size="sm" />
          </div>
          <div className="hidden sm:block">
            <Wordmark />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-6 shadow-card sm:p-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Consideration offer
            </p>
            <h1 className="mt-2 font-display text-2xl text-ink">
              A place has been reserved for you
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              After a closer look at your application, the academy is offering you
              a consideration place in the cohort.
            </p>
          </div>

          <div className="my-6 flex items-center justify-center gap-2 rounded-sm bg-gold-tint px-4 py-2.5 text-sm text-gold">
            <CalendarClock className="size-4" />
            Complete your payment within 72 hours to hold your seat.
          </div>

          <ConsiderationForm />
        </div>
      </div>
    </div>
  );
}
