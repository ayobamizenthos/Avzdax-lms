import type { Metadata } from "next";
import { format, isFuture } from "date-fns";
import { CalendarClock, Video } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourse } from "@/lib/data/student";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Live classes",
};

export default async function ClassesPage() {
  const profile = await requireRole("student");
  const course = await getEnrolledCourse(profile.id);

  if (!course) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No classes scheduled"
        description="Your live sessions will appear here once your course begins."
      />
    );
  }

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, title, teams_url, starts_at, duration_minutes")
    .eq("course_id", course.id)
    .order("starts_at", { ascending: true });

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Virtual classroom"
        title="Live classes"
        description="Join mentor-led sessions on Microsoft Teams and revisit the schedule anytime."
      />

      {!sessions || sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No classes scheduled yet"
          description="Check back soon. Your mentor will publish the schedule here."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const start = new Date(session.starts_at);
            const upcoming = isFuture(start);
            return (
              <Card key={session.id}>
                <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-md bg-brand-tint text-brand">
                      <Video className="size-6" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-lg text-ink">
                          {session.title}
                        </h2>
                        {upcoming ? (
                          <Badge tone="brand">Upcoming</Badge>
                        ) : (
                          <Badge>Ended</Badge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                        <CalendarClock className="size-4" />
                        {format(start, "EEEE, MMM d · h:mm a")} ·{" "}
                        {session.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  {upcoming ? (
                    <LinkButton href={session.teams_url} target="_blank">
                      Join on Teams
                    </LinkButton>
                  ) : (
                    <LinkButton
                      href={session.teams_url}
                      target="_blank"
                      variant="secondary"
                    >
                      View recording
                    </LinkButton>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
