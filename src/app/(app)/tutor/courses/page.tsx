import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LibraryBig } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateCourse } from "@/components/tutor/create-course";

export const metadata: Metadata = {
  title: "Courses",
};

export default async function TutorCoursesPage() {
  await requireRole("tutor", "admin");
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, summary, is_published, modules(id, lessons(id))")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Curriculum"
        title="Courses"
        description="Create courses, structure modules and lessons, and publish when they're ready."
        action={<CreateCourse />}
      />

      {!courses || courses.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="No courses yet"
          description="Create your first course to start building the curriculum."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const lessonCount =
              course.modules?.reduce(
                (sum, module) => sum + (module.lessons?.length ?? 0),
                0
              ) ?? 0;
            return (
              <Link key={course.id} href={`/tutor/courses/${course.id}`}>
                <Card className="h-full transition-colors hover:border-brand">
                  <CardBody>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-lg text-ink">
                        {course.title}
                      </h2>
                      {course.is_published ? (
                        <Badge tone="brand">Published</Badge>
                      ) : (
                        <Badge>Draft</Badge>
                      )}
                    </div>
                    {course.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                        {course.summary}
                      </p>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between text-sm text-muted">
                      <span>
                        {course.modules?.length ?? 0} modules · {lessonCount}{" "}
                        lessons
                      </span>
                      <ArrowRight className="size-4" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
