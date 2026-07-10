import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  PlayCircle,
  Video,
} from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourse } from "@/lib/data/student";
import { PageHeader, StatCard } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentOverview() {
  const profile = await requireRole("student");
  const course = await getEnrolledCourse(profile.id);
  const supabase = await createClient();

  const nextLesson = course?.modules
    .flatMap((unit) => unit.lessons)
    .find((lesson) => !lesson.completed);

  const { data: upcomingClass } = course
    ? await supabase
        .from("class_sessions")
        .select("id, title, teams_url, starts_at")
        .eq("course_id", course.id)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { count: pendingAssignments } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", profile.id)
    .eq("status", "pending");

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Your dashboard"
        title={`Welcome back, ${profile.full_name.split(" ")[0]}`}
        description="Pick up where you left off and keep your momentum through the cohort."
      />

      {course ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
              <ProgressRing value={course.progress} size={96} stroke={8} />
              <div className="min-w-0 flex-1">
                <Badge tone="brand">Enrolled course</Badge>
                <h2 className="mt-3 font-display text-2xl text-ink">
                  {course.title}
                </h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  {course.completedLessons} of {course.totalLessons} lessons
                  complete
                </p>
                <div className="mt-5">
                  <LinkButton href="/learn/course">
                    <PlayCircle className="size-4" />
                    {nextLesson ? "Continue learning" : "Review course"}
                    <ArrowRight className="size-4" />
                  </LinkButton>
                </div>
              </div>
            </div>
            {nextLesson ? (
              <div className="border-t border-line bg-paper/60 px-6 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Up next
                </p>
                <p className="mt-1 font-medium text-ink">{nextLesson.title}</p>
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6">
            <StatCard
              label="Course progress"
              value={`${Math.round(course.progress)}%`}
              sublabel={`${course.totalLessons - course.completedLessons} lessons remaining`}
              icon={<BookOpen className="size-5" strokeWidth={1.9} />}
            />
            <StatCard
              label="Assignments due"
              value={pendingAssignments ?? 0}
              sublabel="Awaiting your submission or grade"
              icon={<ClipboardCheck className="size-5" strokeWidth={1.9} />}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No course assigned yet"
          description="Your mentor will assign your course shortly. Check back soon or reach out to the academy team."
        />
      )}

      {upcomingClass ? (
        <Card className="mt-6">
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-md bg-brand-tint text-brand">
                <Video className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Next live class
                </p>
                <p className="font-display text-lg text-ink">
                  {upcomingClass.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                  <CalendarClock className="size-4" />
                  {format(new Date(upcomingClass.starts_at), "EEE, MMM d · h:mm a")}
                </p>
              </div>
            </div>
            <LinkButton
              href={upcomingClass.teams_url}
              target="_blank"
              variant="secondary"
            >
              Join on Teams
            </LinkButton>
          </CardBody>
        </Card>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/learn/assignments"
          className="text-sm font-medium text-brand hover:underline"
        >
          View assignments →
        </Link>
        <Link
          href="/learn/classes"
          className="text-sm font-medium text-brand hover:underline"
        >
          Class schedule →
        </Link>
      </div>
    </div>
  );
}
