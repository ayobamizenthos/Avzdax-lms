"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Lock, LockOpen, Pencil, Trash2, X } from "lucide-react";

import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  deleteModule,
  setModuleLock,
  updateModule,
} from "@/app/(app)/tutor/actions";

export function ModuleHeader({
  courseId,
  moduleId,
  index,
  title,
  isLocked,
  lessonCount,
}: {
  courseId: string;
  moduleId: string;
  index: number;
  title: string;
  isLocked: boolean;
  lessonCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateModule(courseId, moduleId, value);
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="max-w-sm"
          />
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="grid size-8 place-items-center rounded-sm bg-brand text-brand-ink"
            aria-label="Save module title"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setValue(title);
              setEditing(false);
            }}
            className="grid size-8 place-items-center rounded-sm text-muted hover:text-ink"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <h2 className="flex items-center gap-2 font-display text-lg text-ink">
          Module {index + 1} · {title}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="grid size-7 place-items-center rounded-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
            aria-label="Rename module"
          >
            <Pencil className="size-3.5" />
          </button>
        </h2>
      )}

      <div className="flex items-center gap-2">
        {isLocked ? <Badge>Locked</Badge> : <Badge>{lessonCount} lessons</Badge>}
        <button
          type="button"
          onClick={() =>
            startTransition(() =>
              setModuleLock(courseId, moduleId, !isLocked).then(() => {})
            )
          }
          className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
          aria-label={isLocked ? "Unlock module" : "Lock module"}
        >
          {isLocked ? (
            <>
              <LockOpen className="size-4" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="size-4" />
              Lock
            </>
          )}
        </button>
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                startTransition(() => deleteModule(courseId, moduleId).then(() => {}))
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
            aria-label="Delete module"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
