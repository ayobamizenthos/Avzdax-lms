"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { FileUp, Link2, Loader2, PenLine } from "lucide-react";

import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { playSuccess } from "@/lib/notification-sound";
import {
  submitAssignment,
  type SubmitState,
} from "@/app/(app)/learn/assignments/actions";

type Kind = "text" | "file" | "link";

const options: { kind: Kind; label: string; icon: typeof PenLine }[] = [
  { kind: "text", label: "Write", icon: PenLine },
  { kind: "file", label: "Files", icon: FileUp },
  { kind: "link", label: "Link", icon: Link2 },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : "Submit work"}
    </Button>
  );
}

export function AssignmentSubmit({ assignmentId }: { assignmentId: string }) {
  const [kind, setKind] = useState<Kind>("text");
  const [state, formAction] = useActionState<SubmitState, FormData>(
    submitAssignment,
    { error: null, ok: false }
  );

  useEffect(() => {
    if (state.ok) playSuccess();
  }, [state.ok]);

  if (state.ok) {
    return (
      <p className="rounded-sm border border-brand/25 bg-brand-tint px-4 py-3 text-sm text-brand-deep">
        Submitted. Your tutor will review it shortly.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <input type="hidden" name="kind" value={kind} />

      <div className="inline-flex rounded-sm border border-line bg-paper p-1">
        {options.map((option) => (
          <button
            key={option.kind}
            type="button"
            onClick={() => setKind(option.kind)}
            className={cn(
              "flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors",
              kind === option.kind
                ? "bg-surface text-ink shadow-card"
                : "text-muted hover:text-ink"
            )}
          >
            <option.icon className="size-4" />
            {option.label}
          </button>
        ))}
      </div>

      {kind === "text" ? (
        <Textarea
          name="body"
          rows={5}
          placeholder="Write your response…"
          required
        />
      ) : kind === "link" ? (
        <Input
          name="link_url"
          type="url"
          placeholder="https://your-project.example.com"
          required
        />
      ) : (
        <div>
          <Input name="file" type="file" multiple required className="pt-2.5" />
          <p className="mt-1.5 text-sm text-muted">
            You can attach multiple documents at once.
          </p>
        </div>
      )}

      {state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
