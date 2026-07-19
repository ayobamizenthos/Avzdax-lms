"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2, Lock, LockOpen, Pencil, PlayCircle, Trash2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { AddResource } from "@/components/tutor/builder-forms";
import {
  deleteLesson,
  deleteResource,
  setLessonLock,
  updateLesson,
} from "@/app/(app)/tutor/actions";

type Resource = { id: string; name: string };
type Lesson = {
  id: string;
  title: string;
  youtube_id: string | null;
  body: string | null;
  is_locked: boolean;
  resources: Resource[];
};

export function LessonManager({
  courseId,
  lesson,
}: {
  courseId: string;
  lesson: Lesson;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await updateLesson(courseId, lesson.id, formData);
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
        <Field label="Lesson title">
          <Input name="title" defaultValue={lesson.title} required />
        </Field>
        <Field
          label="YouTube link or ID"
          hint="Paste any YouTube link. It plays inside the lesson, hosted on YouTube."
        >
          <Input
            name="youtube"
            defaultValue={lesson.youtube_id ?? ""}
            placeholder="https://youtu.be/…"
          />
        </Field>
        <Field label="Lesson notes">
          <Textarea name="body" defaultValue={lesson.body ?? ""} rows={3} />
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
    <div className="rounded-sm border border-line px-3.5 py-3">
      <div className="flex items-center gap-3 text-sm">
        <PlayCircle className="size-4 text-brand" />
        <span className="flex-1 text-ink">{lesson.title}</span>
        {lesson.is_locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-medium text-ink-soft">
            <Lock className="size-3" />
            Locked
          </span>
        ) : null}
        <button
          type="button"
          onClick={() =>
            startTransition(() =>
              setLessonLock(courseId, lesson.id, !lesson.is_locked).then(() => {})
            )
          }
          className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
          aria-label={lesson.is_locked ? "Unlock lesson" : "Lock lesson"}
        >
          {lesson.is_locked ? (
            <Lock className="size-4" />
          ) : (
            <LockOpen className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
          aria-label="Edit lesson"
        >
          <Pencil className="size-4" />
        </button>
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                startTransition(() => deleteLesson(courseId, lesson.id).then(() => {}))
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
            aria-label="Delete lesson"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {lesson.resources.length > 0 ? (
        <ul className="mt-2 space-y-1 pl-7">
          {lesson.resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-center gap-2 text-xs text-muted"
            >
              <FileText className="size-3.5" />
              <span className="flex-1">{resource.name}</span>
              <button
                type="button"
                onClick={() =>
                  startTransition(() =>
                    deleteResource(courseId, resource.id).then(() => {})
                  )
                }
                className="text-muted transition-colors hover:text-danger"
                aria-label="Delete material"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={cn("mt-2 pl-7")}>
        <AddResource courseId={courseId} lessonId={lesson.id} />
      </div>
    </div>
  );
}
