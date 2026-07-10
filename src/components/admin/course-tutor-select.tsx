"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Select } from "@/components/ui/field";
import { assignCourseTutor } from "@/app/(app)/admin/actions";

export function CourseTutorSelect({
  courseId,
  tutorId,
  tutors,
}: {
  courseId: string;
  tutorId: string | null;
  tutors: { id: string; full_name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Course tutor"
        defaultValue={tutorId ?? ""}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value;
          if (next) {
            startTransition(() =>
              assignCourseTutor(courseId, next).then(() => {})
            );
          }
        }}
        className="h-9 text-sm"
      >
        <option value="">Unassigned</option>
        {tutors.map((tutor) => (
          <option key={tutor.id} value={tutor.id}>
            {tutor.full_name}
          </option>
        ))}
      </Select>
      {pending ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
    </div>
  );
}
