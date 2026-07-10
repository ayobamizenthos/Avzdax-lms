"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Copy, Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Card, CardBody } from "@/components/ui/card";
import { createUser } from "@/app/(app)/admin/actions";

export function CreateUser({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (credentials) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-2 text-brand">
            <Check className="size-5" />
            <p className="font-medium">Account created</p>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Share these login details with the new member. This password
            won&rsquo;t be shown again.
          </p>
          <div className="mt-4 space-y-2 rounded-sm border border-line bg-paper p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span className="font-medium text-ink">{credentials.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Password</span>
              <span className="font-mono font-medium text-ink">
                {credentials.password}
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(
                  `Email: ${credentials.email}\nPassword: ${credentials.password}\nSign in at https://lms.avzdax.com`
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy details"}
            </Button>
            <Button
              onClick={() => {
                setCredentials(null);
                setOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        Create account
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
              const result = await createUser(formData);
              if (result.error) {
                setError(result.error);
              } else if (result.password) {
                setError(null);
                setCredentials({
                  email: String(formData.get("email")).toLowerCase(),
                  password: result.password,
                });
              }
            })
          }
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Full name">
            <Input name="full_name" placeholder="Jane Doe" required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" placeholder="jane@example.com" required />
          </Field>
          <Field label="Role">
            <Select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Administrator</option>
            </Select>
          </Field>
          <Field label="Temporary password" hint="Leave blank to auto-generate.">
            <Input name="password" placeholder="Auto-generated" />
          </Field>
          {role === "student" || role === "tutor" ? (
            <div className="sm:col-span-2">
              <Field
                label={role === "tutor" ? "Assign as tutor for" : "Assign course"}
                hint={
                  role === "tutor"
                    ? "This tutor will own the course and everything in it."
                    : undefined
                }
              >
                <Select name="course_id" defaultValue="">
                  <option value="">
                    {role === "tutor" ? "No course yet" : "No course yet"}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-danger sm:col-span-2">{error}</p>
          ) : null}
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
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
