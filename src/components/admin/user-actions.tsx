"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Select } from "@/components/ui/field";
import { deleteUser, enrollStudent, updateRole } from "@/app/(app)/admin/actions";
import type { Role } from "@/lib/session";

export function UserActions({
  userId,
  role,
  courses,
  enrolledCourseId,
  isSelf,
}: {
  userId: string;
  role: Role;
  courses: { id: string; title: string }[];
  enrolledCourseId: string | null;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Select
        aria-label="Role"
        defaultValue={role}
        disabled={isSelf || pending}
        onChange={(event) =>
          startTransition(() =>
            updateRole(userId, event.target.value as Role).then(() => {})
          )
        }
        className="h-9 w-32 text-sm"
      >
        <option value="student">Student</option>
        <option value="tutor">Tutor</option>
        <option value="admin">Admin</option>
      </Select>

      {role === "student" ? (
        <Select
          aria-label="Course"
          defaultValue={enrolledCourseId ?? ""}
          disabled={pending}
          onChange={(event) => {
            const courseId = event.target.value;
            if (courseId) {
              startTransition(() =>
                enrollStudent(userId, courseId).then(() => {})
              );
            }
          }}
          className="h-9 w-40 text-sm"
        >
          <option value="">Assign course…</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </Select>
      ) : null}

      {isSelf ? null : confirming ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              startTransition(() => deleteUser(userId).then(() => {}))
            }
            className="rounded-sm bg-danger px-2.5 py-1.5 text-xs font-medium text-white"
          >
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-sm px-2 py-1.5 text-xs text-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="grid size-9 place-items-center rounded-sm border border-line text-muted transition-colors hover:border-danger hover:text-danger"
          aria-label="Remove user"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
