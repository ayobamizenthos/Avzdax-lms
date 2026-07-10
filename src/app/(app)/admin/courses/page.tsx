import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { CreateCourse } from "@/components/tutor/create-course";
import { CoursesDirectory } from "@/components/admin/courses-directory";

export const metadata: Metadata = {
  title: "Courses",
};

export default async function AdminCoursesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: courses }, { data: tutors }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, tutor_id, is_published, modules(id), enrollments(id)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "tutor")
      .order("full_name"),
  ]);

  const directory = (courses ?? []).map((course) => ({
    id: course.id,
    title: course.title,
    tutor_id: course.tutor_id,
    is_published: course.is_published,
    moduleCount: course.modules?.length ?? 0,
    enrolledCount: course.enrollments?.length ?? 0,
  }));

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Curriculum"
        title="All courses"
        description="Search courses, see enrolment, and assign or reassign each course's tutor."
        action={<CreateCourse />}
      />

      <CoursesDirectory courses={directory} tutors={tutors ?? []} />
    </div>
  );
}
