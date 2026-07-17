import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ScheduleClass } from "@/components/tutor/schedule-class";
import { ClassManager } from "@/components/tutor/class-manager";

export const metadata: Metadata = {
  title: "Live classes",
};

export default async function TutorClassesPage() {
  await requireRole("tutor", "admin");
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, title, teams_url, starts_at, duration_minutes, course:courses(title)")
    .order("starts_at", { ascending: false });

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Virtual classroom"
        title="Live classes"
        description="Schedule Teams sessions and your students are notified automatically."
        action={<ScheduleClass courses={courses ?? []} />}
      />

      {!sessions || sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No classes scheduled"
          description="Schedule your first live session to bring the cohort together."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const course = session.course as { title: string } | null;
            return (
              <ClassManager
                key={session.id}
                session={{
                  id: session.id,
                  title: session.title,
                  teams_url: session.teams_url,
                  starts_at: session.starts_at,
                  duration_minutes: session.duration_minutes,
                  courseTitle: course?.title ?? null,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
