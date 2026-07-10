"use client";

import { useRef, useState, useTransition } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Card, CardBody } from "@/components/ui/card";
import { scheduleClass } from "@/app/(app)/tutor/actions";

export function ScheduleClass({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} disabled={courses.length === 0}>
        <CalendarPlus className="size-4" />
        Schedule class
      </Button>
    );
  }

  return (
    <Card>
      <CardBody>
        <form
          ref={formRef}
          action={(formData) =>
            startTransition(async () => {
              const courseId = String(formData.get("course_id"));
              const result = await scheduleClass(courseId, formData);
              if (result.error) setError(result.error);
              else {
                formRef.current?.reset();
                setOpen(false);
              }
            })
          }
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Field label="Course">
              <Select name="course_id" required>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Class title">
              <Input name="title" placeholder="e.g. Week 2 · Live Review" required />
            </Field>
          </div>
          <Field label="Teams link">
            <Input name="teams_url" type="url" placeholder="https://teams.microsoft.com/…" required />
          </Field>
          <Field label="Duration (minutes)">
            <Input name="duration" type="number" defaultValue={60} min={15} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Starts at">
              <Input name="starts_at" type="datetime-local" required />
            </Field>
          </div>
          {error ? (
            <p className="text-sm text-danger sm:col-span-2">{error}</p>
          ) : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Schedule"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
