import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { requireRole } from "@/lib/session";
import { getEnrolledCourse } from "@/lib/data/student";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CoursePlayer } from "@/components/learn/course-player";

export const metadata: Metadata = {
  title: "My course",
};

export default async function CoursePage() {
  const profile = await requireRole("student");
  const course = await getEnrolledCourse(profile.id);

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No course assigned yet"
        description="Your mentor will assign your course shortly. Check back soon."
      />
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Now learning" title={course.title} description={course.summary ?? undefined} />
      <CoursePlayer course={course} />
    </div>
  );
}
