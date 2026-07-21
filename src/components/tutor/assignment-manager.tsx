"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { deleteAssignment, updateAssignment } from "@/app/(app)/tutor/actions";
import { LockToggle } from "@/components/tutor/lock-toggle";

type Assignment = {
  id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  is_locked: boolean;
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function AssignmentManager({
  courseId,
  assignment,
}: {
  courseId: string;
  assignment: Assignment;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await updateAssignment(courseId, assignment.id, formData);
      if (result.error) setError(result.error);
      else {
        setError(null);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <form
        action={save}
        className="space-y-3 rounded-sm border border-line bg-paper p-4"
      >
        <Field label="Assignment title">
          <Input name="title" defaultValue={assignment.title} required />
        </Field>
        <Field label="Instructions">
          <Textarea
            name="instructions"
            defaultValue={assignment.instructions ?? ""}
            rows={3}
          />
        </Field>
        <Field label="Due date">
          <Input
            name="due_at"
            type="datetime-local"
            defaultValue={toLocalInput(assignment.due_at)}
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-sm border border-line px-3.5 py-2.5 text-sm">
      <FileText className="size-4 text-gold" />
      <span className="flex-1 text-ink">{assignment.title}</span>
      <Badge tone="gold">Assignment</Badge>
      <LockToggle
        courseId={courseId}
        itemId={assignment.id}
        kind="assignment"
        locked={assignment.is_locked}
      />
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
        aria-label="Edit assignment"
      >
        <Pencil className="size-4" />
      </button>
      {confirming ? (
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              startTransition(() =>
                deleteAssignment(courseId, assignment.id).then(() => {})
              )
            }
            className="rounded-sm bg-danger px-2 py-1 text-xs font-medium text-white"
          >
            {pending ? "…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-muted hover:text-ink"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-danger-tint hover:text-danger"
          aria-label="Delete assignment"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
