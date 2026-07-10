"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, CardBody } from "@/components/ui/card";
import { createCourse } from "@/app/(app)/tutor/actions";

export function CreateCourse() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New course
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardBody>
        <form
          ref={formRef}
          action={(formData) =>
            startTransition(async () => {
              const result = await createCourse(formData);
              if (result.error) {
                setError(result.error);
              } else {
                formRef.current?.reset();
                setOpen(false);
              }
            })
          }
          className="space-y-4"
        >
          <Field label="Course title">
            <Input name="title" placeholder="e.g. Frontend Engineering" required />
          </Field>
          <Field label="Summary" hint="A short description students will see.">
            <Textarea name="summary" rows={3} placeholder="What will they learn?" />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Create course"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
