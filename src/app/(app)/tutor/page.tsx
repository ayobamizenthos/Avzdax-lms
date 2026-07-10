import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  ClipboardCheck,
  LibraryBig,
  Users,
  Video,
} from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function TutorOverview() {
  const profile = await requireRole("tutor", "admin");
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, is_published, modules(id)")
    .order("created_at", { ascending: false });

  const { count: pendingCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student");

  const { data: upcoming } = await supabase
    .from("class_sessions")
    .select("id, title, starts_at")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(3);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Tutor workspace"
        title={`Welcome, ${profile.full_name.split(" ")[0]}`}
        description="Build your courses, publish new material, and keep your cohort moving."
        action={
          <LinkButton href="/tutor/courses">
            <LibraryBig className="size-4" />
            Manage courses
          </LinkButton>
        }
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Courses"
          value={courses?.length ?? 0}
          sublabel={`${courses?.filter((c) => c.is_published).length ?? 0} published`}
          icon={<LibraryBig className="size-5" strokeWidth={1.9} />}
        />
        <StatCard
          label="Submissions to grade"
          value={pendingCount ?? 0}
          sublabel="Awaiting your review"
          icon={<ClipboardCheck className="size-5" strokeWidth={1.9} />}
        />
        <StatCard
          label="Students"
          value={studentCount ?? 0}
          sublabel="Active in the academy"
          icon={<Users className="size-5" strokeWidth={1.9} />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Your courses</h2>
              <Link
                href="/tutor/courses"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {(courses ?? []).slice(0, 4).map((course) => (
                <Link
                  key={course.id}
                  href={`/tutor/courses/${course.id}`}
                  className="flex items-center justify-between rounded-sm border border-line px-4 py-3 transition-colors hover:border-brand"
                >
                  <div>
                    <p className="font-medium text-ink">{course.title}</p>
                    <p className="text-xs text-muted">
                      {course.modules?.length ?? 0} modules
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {course.is_published ? (
                      <Badge tone="brand">Published</Badge>
                    ) : (
                      <Badge>Draft</Badge>
                    )}
                    <ArrowRight className="size-4 text-muted" />
                  </div>
                </Link>
              ))}
              {(courses ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  No courses yet. Create your first one.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-display text-lg text-ink">Upcoming classes</h2>
            <div className="mt-4 space-y-2">
              {(upcoming ?? []).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-sm border border-line px-4 py-3"
                >
                  <span className="grid size-9 place-items-center rounded-md bg-brand-tint text-brand">
                    <Video className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium text-ink">{session.title}</p>
                    <p className="text-xs text-muted">
                      {format(new Date(session.starts_at), "MMM d · h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              {(upcoming ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  No classes scheduled.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
