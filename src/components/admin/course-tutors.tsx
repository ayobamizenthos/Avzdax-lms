"use client";

import { useTransition } from "react";
import { Loader2, X } from "lucide-react";

import { Select } from "@/components/ui/field";
import { addCourseTutor, removeCourseTutor } from "@/app/(app)/admin/actions";

type Tutor = { id: string; full_name: string };

export function CourseTutors({
  courseId,
  assignedIds,
  tutors,
}: {
  courseId: string;
  assignedIds: string[];
  tutors: Tutor[];
}) {
  const [pending, startTransition] = useTransition();

  const nameOf = new Map(tutors.map((tutor) => [tutor.id, tutor.full_name]));
  const assigned = assignedIds.filter((id) => nameOf.has(id));
  const available = tutors.filter((tutor) => !assignedIds.includes(tutor.id));

  return (
    <div className="space-y-2">
      {assigned.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {assigned.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-ink"
            >
              {nameOf.get(id)}
              <button
                type="button"
                aria-label={`Remove ${nameOf.get(id)}`}
                disabled={pending}
                onClick={() =>
                  startTransition(() =>
                    removeCourseTutor(courseId, id).then(() => {})
                  )
                }
                className="text-muted transition-colors hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted">No tutors assigned yet.</p>
      )}

      <div className="flex items-center gap-2">
        <Select
          aria-label="Add tutor"
          value=""
          disabled={pending || available.length === 0}
          onChange={(event) => {
            const next = event.target.value;
            if (next) {
              startTransition(() =>
                addCourseTutor(courseId, next).then(() => {})
              );
            }
          }}
          className="h-9 text-sm"
        >
          <option value="">
            {available.length === 0 ? "All tutors added" : "Add a tutor"}
          </option>
          {available.map((tutor) => (
            <option key={tutor.id} value={tutor.id}>
              {tutor.full_name}
            </option>
          ))}
        </Select>
        {pending ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
      </div>
    </div>
  );
}
