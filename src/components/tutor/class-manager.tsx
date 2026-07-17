"use client";

import { useState, useTransition } from "react";
import { format, isFuture } from "date-fns";
import { Loader2, Pencil, Trash2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { deleteClass, updateClass } from "@/app/(app)/tutor/actions";

type Session = {
  id: string;
  title: string;
  teams_url: string;
  starts_at: string;
  duration_minutes: number;
  courseTitle: string | null;
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function ClassManager({ session }: { session: Session }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const start = new Date(session.starts_at);

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await updateClass(session.id, formData);
      if (result.error) setError(result.error);
      else {
        setError(null);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <Card>
        <CardBody>
          <form action={save} className="space-y-4">
            <Field label="Session title">
              <Input name="title" defaultValue={session.title} required />
            </Field>
            <Field label="Microsoft Teams link">
              <Input
                name="teams_url"
                type="url"
                defaultValue={session.teams_url}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts at">
                <Input
                  name="starts_at"
                  type="datetime-local"
                  defaultValue={toLocalInput(session.starts_at)}
                  required
                />
              </Field>
              <Field label="Duration (minutes)">
                <Input
                  name="duration"
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={session.duration_minutes}
                />
              </Field>
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
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
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-md bg-brand-tint text-brand">
            <Video className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink">{session.title}</p>
              {isFuture(start) ? (
                <Badge tone="brand">Upcoming</Badge>
              ) : (
                <Badge>Ended</Badge>
              )}
            </div>
            <p className="text-sm text-muted">
              {session.courseTitle} · {format(start, "MMM d · h:mm a")} ·{" "}
              {session.duration_minutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={session.teams_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand hover:underline"
          >
            Open link
          </a>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
            aria-label="Edit class"
          >
            <Pencil className="size-4" />
          </button>
          {confirming ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  startTransition(() => deleteClass(session.id).then(() => {}))
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
              aria-label="Delete class"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
