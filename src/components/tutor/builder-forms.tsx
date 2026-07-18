"use client";

import { useRef, useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  FileUp,
  Loader2,
  Plus,
  Video,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Trash2 } from "lucide-react";

import {
  addAssignment,
  addLesson,
  addModule,
  addResource,
  deleteModule,
  togglePublish,
} from "@/app/(app)/tutor/actions";

export function DeleteModule({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() =>
            startTransition(() => deleteModule(courseId, moduleId).then(() => {}))
          }
          className="rounded-sm bg-danger px-2.5 py-1 text-xs font-medium text-white"
        >
          {pending ? "…" : "Delete module"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-muted hover:text-ink"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-danger-tint hover:text-danger"
      aria-label="Delete module"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

export function PublishToggle({
  courseId,
  published,
}: {
  courseId: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant={published ? "secondary" : "primary"}
      disabled={pending}
      onClick={() =>
        startTransition(() => togglePublish(courseId, !published).then(() => {}))
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : published ? (
        <>
          <EyeOff className="size-4" />
          Unpublish
        </>
      ) : (
        <>
          <Eye className="size-4" />
          Publish course
        </>
      )}
    </Button>
  );
}

function useInlineForm(handler: (formData: FormData) => Promise<{ error: string | null }>) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await handler(formData);
      if (result.error) setError(result.error);
      else {
        setError(null);
        formRef.current?.reset();
      }
    });
  }

  return { error, pending, formRef, action };
}

export function AddModule({ courseId }: { courseId: string }) {
  const { error, pending, formRef, action } = useInlineForm((formData) =>
    addModule(courseId, formData)
  );

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3">
      <div className="w-full min-w-0 sm:flex-1">
        <Field label="New module">
          <Input name="title" placeholder="e.g. Working with APIs" required />
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add module
      </Button>
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}

export function AddLesson({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const [open, setOpen] = useState(false);
  const { error, pending, formRef, action } = useInlineForm((formData) =>
    addLesson(courseId, moduleId, formData)
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        <Video className="size-4" />
        Add lesson
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        action(formData);
      }}
      className="space-y-3 rounded-sm border border-line bg-paper p-4"
    >
      <Field label="Lesson title">
        <Input name="title" placeholder="Lesson title" required />
      </Field>
      <Field label="YouTube link or ID" hint="Plays inside the lesson so students never leave the platform.">
        <Input name="youtube" placeholder="https://youtu.be/…" />
      </Field>
      <Field label="Lesson notes">
        <Textarea name="body" rows={3} placeholder="Notes or context for this lesson" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Save lesson"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddAssignment({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const [open, setOpen] = useState(false);
  const { error, pending, formRef, action } = useInlineForm((formData) =>
    addAssignment(courseId, moduleId, formData)
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-gold hover:underline"
      >
        <ClipboardList className="size-4" />
        Add assignment
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-3 rounded-sm border border-line bg-paper p-4"
    >
      <Field label="Assignment title">
        <Input name="title" placeholder="Assignment title" required />
      </Field>
      <Field label="Instructions">
        <Textarea name="instructions" rows={3} placeholder="What should students do?" />
      </Field>
      <Field label="Due date">
        <Input name="due_at" type="date" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Save assignment"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddResource({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [open, setOpen] = useState(false);
  const { error, pending, formRef, action } = useInlineForm((formData) =>
    addResource(courseId, lessonId, formData)
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <FileUp className="size-4" />
        Upload material
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-3 rounded-sm border border-line bg-paper p-4"
    >
      <Field label="Material name" hint="Shown to students under the lesson.">
        <Input name="name" placeholder="e.g. Lecture slides (PDF)" />
      </Field>
      <Field label="File">
        <Input name="file" type="file" required className="pt-2.5" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Upload"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
