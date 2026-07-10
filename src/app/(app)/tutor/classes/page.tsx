import type { Metadata } from "next";
import { format, isFuture } from "date-fns";
import { CalendarClock, Video } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScheduleClass } from "@/components/tutor/schedule-class";

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
            const start = new Date(session.starts_at);
            const course = session.course as { title: string } | null;
            return (
              <Card key={session.id}>
                <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid size-11 place-items-center rounded-md bg-brand-tint text-brand">
                      <Video className="size-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink">{session.title}</p>
                        {isFuture(start) ? (
                          <Badge tone="brand">Upcoming</Badge>
                        ) : (
                          <Badge>Ended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted">
                        {course?.title} · {format(start, "MMM d · h:mm a")} ·{" "}
                        {session.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  <a
                    href={session.teams_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Open link
                  </a>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
