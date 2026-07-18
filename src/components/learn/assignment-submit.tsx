"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { playSuccess } from "@/lib/notification-sound";
import {
  submitAssignment,
  type SubmitState,
} from "@/app/(app)/learn/assignments/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : "Submit work"}
    </Button>
  );
}

export function AssignmentSubmit({ assignmentId }: { assignmentId: string }) {
  const [links, setLinks] = useState<string[]>([""]);
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
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="assignment_id" value={assignmentId} />

      <div>
        <Label htmlFor={`body-${assignmentId}`}>Written response</Label>
        <Textarea
          id={`body-${assignmentId}`}
          name="body"
          rows={5}
          placeholder="Type your answer here"
        />
      </div>

      <div>
        <Label>Attachments</Label>
        <Input name="file" type="file" multiple className="pt-2.5" />
        <p className="mt-1.5 text-sm text-muted">
          Attach one or more files.
        </p>
      </div>

      <div>
        <Label>Links</Label>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="link_url"
                type="url"
                value={link}
                onChange={(event) =>
                  setLinks((prev) =>
                    prev.map((value, i) =>
                      i === index ? event.target.value : value
                    )
                  )
                }
                placeholder="https://your-project.example.com"
              />
              {links.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setLinks((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-danger-tint hover:text-danger"
                  aria-label="Remove link"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLinks((prev) => [...prev, ""])}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <Plus className="size-4" />
          Add another link
        </button>
      </div>

      {state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}

      <SubmitButton />

      <p className="text-xs text-muted">
        Submit any combination of written text, files and links.
      </p>
    </form>
  );
}
