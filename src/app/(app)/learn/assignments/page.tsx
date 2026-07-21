import type { Metadata } from "next";
import { format, isPast } from "date-fns";
import { ClipboardCheck, Lock } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourse } from "@/lib/data/student";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AssignmentSubmit } from "@/components/learn/assignment-submit";

export const metadata: Metadata = {
  title: "Assignments",
};

export default async function AssignmentsPage() {
  const profile = await requireRole("student");
  const course = await getEnrolledCourse(profile.id);

  if (!course) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No assignments yet"
        description="Assignments appear here once your course is assigned."
      />
    );
  }

  const supabase = await createClient();
  const moduleIds = course.modules.map((unit) => unit.id);
  const lockedModules = new Set(
    course.modules.filter((unit) => unit.locked).map((unit) => unit.id)
  );

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, instructions, due_at, module_id, is_locked")
    .in("module_id", moduleIds)
    .order("due_at", { ascending: true });

  const { data: submissions } = await supabase
    .from("submissions")
    .select("assignment_id, status, score, feedback, kind, submitted_at")
    .eq("student_id", profile.id);

  const byAssignment = new Map(
    (submissions ?? []).map((submission) => [submission.assignment_id, submission])
  );

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Coursework"
        title="Assignments"
        description="Submit your work, then track feedback and grades from your tutor."
      />

      {!assignments || assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing due right now"
          description="You're all caught up. New assignments will show up here."
        />
      ) : (
        <div className="space-y-5">
          {assignments.map((assignment) => {
            const submission = byAssignment.get(assignment.id);
            const graded = submission?.status === "graded";
            const locked =
              assignment.is_locked || lockedModules.has(assignment.module_id);
            const overdue =
              assignment.due_at &&
              isPast(new Date(assignment.due_at)) &&
              !submission;

            if (locked) {
              return (
                <Card key={assignment.id}>
                  <CardBody>
                    <div className="flex items-center gap-3">
                      <Lock className="size-4 text-muted" />
                      <h2 className="flex-1 font-display text-lg text-muted">
                        {assignment.title}
                      </h2>
                      <Badge>Locked</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      Your tutor will unlock this assignment when it&rsquo;s ready.
                    </p>
                  </CardBody>
                </Card>
              );
            }

            return (
              <Card key={assignment.id}>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg text-ink">
                        {assignment.title}
                      </h2>
                      {assignment.due_at ? (
                        <p className="mt-1 text-sm text-muted">
                          Due {format(new Date(assignment.due_at), "MMM d, yyyy")}
                        </p>
                      ) : null}
                    </div>
                    {graded ? (
                      <Badge tone="brand">Graded · {submission?.score}%</Badge>
                    ) : submission ? (
                      <Badge tone="gold">Submitted</Badge>
                    ) : overdue ? (
                      <Badge tone="danger">Overdue</Badge>
                    ) : (
                      <Badge>Not submitted</Badge>
                    )}
                  </div>

                  {assignment.instructions ? (
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                      {assignment.instructions}
                    </p>
                  ) : null}

                  <div className="mt-5 border-t border-line pt-5">
                    {graded ? (
                      <div className="rounded-sm bg-brand-tint/50 p-4">
                        <p className="text-sm font-medium text-brand-deep">
                          Tutor feedback
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {submission?.feedback ?? "Great work on this submission."}
                        </p>
                      </div>
                    ) : submission ? (
                      <p className="text-sm text-muted">
                        Submitted on{" "}
                        {format(
                          new Date(submission.submitted_at),
                          "MMM d 'at' h:mm a"
                        )}
                        . Awaiting your tutor&rsquo;s review.
                      </p>
                    ) : (
                      <AssignmentSubmit assignmentId={assignment.id} />
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
