import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { CreateUser } from "@/components/admin/create-user";
import { UsersDirectory } from "@/components/admin/users-directory";

export const metadata: Metadata = {
  title: "People",
};

export default async function AdminUsersPage() {
  const admin = await requireRole("admin");
  const supabase = await createClient();

  const [{ data: people }, { data: courses }, { data: enrollments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, avatar_url")
        .order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title, tutor_id").order("title"),
      supabase.from("enrollments").select("student_id, course_id").eq("status", "active"),
    ]);

  const courseTitleById = new Map((courses ?? []).map((c) => [c.id, c.title]));
  const enrollmentByStudent = new Map(
    (enrollments ?? []).map((row) => [row.student_id, row.course_id])
  );
  const courseByTutor = new Map<string, string>();
  for (const course of courses ?? []) {
    if (course.tutor_id && !courseByTutor.has(course.tutor_id)) {
      courseByTutor.set(course.tutor_id, course.title);
    }
  }

  const directory = (people ?? []).map((person) => {
    let context = "Administrator";
    let enrolledCourseId: string | null = null;
    if (person.role === "student") {
      enrolledCourseId = enrollmentByStudent.get(person.id) ?? null;
      context = enrolledCourseId
        ? courseTitleById.get(enrolledCourseId) ?? "Not assigned"
        : "Not assigned";
    } else if (person.role === "tutor") {
      context = courseByTutor.get(person.id) ?? "No course assigned";
    }
    return { ...person, context, enrolledCourseId };
  });

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="People"
        title="Members"
        description="Create accounts, assign roles and courses, and search everyone in the academy."
      />

      <div className="mb-6">
        <CreateUser
          courses={(courses ?? []).map(({ id, title }) => ({ id, title }))}
        />
      </div>

      <UsersDirectory
        people={directory}
        courses={(courses ?? []).map(({ id, title }) => ({ id, title }))}
        adminId={admin.id}
      />
    </div>
  );
}
