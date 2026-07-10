"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { Award, Download, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { issueCertificate } from "@/app/(app)/learn/certificate/actions";

type Certificate = {
  serial: string;
  issued_at: string;
} | null;

export function CertificateView({
  studentName,
  courseTitle,
  progress,
  certificate,
}: {
  studentName: string;
  courseTitle: string;
  progress: number;
  certificate: Certificate;
}) {
  const [pending, startTransition] = useTransition();
  const complete = progress >= 100;

  if (!certificate) {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold-tint text-gold">
          <Award className="size-8" strokeWidth={1.75} />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink">
          {complete ? "You've earned your certificate" : "Certificate locked"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          {complete
            ? "Congratulations on completing every lesson. Claim your official certificate of completion."
            : `Complete all lessons to unlock your certificate. You're ${Math.round(progress)}% of the way there.`}
        </p>
        {complete ? (
          <Button
            variant="gold"
            className="mt-6"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await issueCertificate();
              })
            }
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="size-4" />
                Claim certificate
              </>
            )}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end print:hidden">
        <Button variant="secondary" onClick={() => window.print()}>
          <Download className="size-4" />
          Download / print
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface print:border-0 print:shadow-none">
        <div className="relative bg-brand-deep px-10 py-14 text-center text-white print:bg-brand-deep">
          <div className="grain absolute inset-0 opacity-40" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Avzdax Academy
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/70">
              Certificate of Completion
            </p>
            <p className="mt-8 text-sm text-white/70">This certifies that</p>
            <h1 className="mt-3 font-display text-4xl text-white">
              {studentName}
            </h1>
            <p className="mt-6 text-sm text-white/70">
              has successfully completed
            </p>
            <h2 className="mt-2 font-display text-2xl text-white">
              {courseTitle}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-between px-10 py-6 text-sm text-muted">
          <div>
            <p className="font-medium text-ink">
              {format(new Date(certificate.issued_at), "MMMM d, yyyy")}
            </p>
            <p>Date issued</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-ink">{certificate.serial}</p>
            <p>Verification serial</p>
          </div>
        </div>
      </div>
    </div>
  );
}
