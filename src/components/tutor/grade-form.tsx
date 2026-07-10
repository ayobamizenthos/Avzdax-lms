"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/field";
import { gradeSubmission } from "@/app/(app)/tutor/actions";

export function GradeForm({ submissionId }: { submissionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await gradeSubmission(submissionId, formData);
          if (result.error) setError(result.error);
        })
      }
      className="space-y-3"
    >
      <div className="flex items-end gap-3">
        <div className="w-28">
          <Label>Score</Label>
          <Input
            name="score"
            type="number"
            min={0}
            max={100}
            placeholder="0 to 100"
            required
          />
        </div>
        <span className="pb-3 text-sm text-muted">/ 100</span>
      </div>
      <div>
        <Label>Feedback</Label>
        <Textarea name="feedback" rows={2} placeholder="Optional feedback for the student" />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Save grade"}
      </Button>
    </form>
  );
}
