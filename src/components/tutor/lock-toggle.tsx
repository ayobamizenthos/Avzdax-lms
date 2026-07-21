"use client";

import { useTransition } from "react";
import { Lock, LockOpen } from "lucide-react";

import { setAssignmentLock, setQuizLock } from "@/app/(app)/tutor/actions";

export function LockToggle({
  courseId,
  itemId,
  kind,
  locked,
}: {
  courseId: string;
  itemId: string;
  kind: "quiz" | "assignment";
  locked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(() => {
      const action = kind === "quiz" ? setQuizLock : setAssignmentLock;
      action(courseId, itemId, !locked).then(() => {});
    });
  }

  return (
    <>
      {locked ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-medium text-ink-soft">
          <Lock className="size-3" />
          Locked
        </span>
      ) : null}
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="grid size-8 place-items-center rounded-sm text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:opacity-50"
        aria-label={locked ? `Unlock ${kind}` : `Lock ${kind}`}
      >
        {locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
      </button>
    </>
  );
}
