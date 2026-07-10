import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Performance",
};

export default async function PerformancePage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: students }, { data: enrollments }, { data: courses }, { data: progress }, { data: attempts }, { data: submissions }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url").eq("role", "student"),
      supabase.from("enrollments").select("student_id, course_id").eq("status", "active"),
      supabase.from("courses").select("id, title, modules(lessons(id))"),
      supabase.from("lesson_progress").select("student_id"),
      supabase.from("quiz_attempts").select("student_id, score"),
      supabase.from("submissions").select("student_id, status"),
    ]);

  const lessonTotals = new Map<string, number>();
  const courseTitles = new Map<string, string>();
  for (const course of courses ?? []) {
    const total =
      course.modules?.reduce(
        (sum, module) => sum + (module.lessons?.length ?? 0),
        0
      ) ?? 0;
    lessonTotals.set(course.id, total);
    courseTitles.set(course.id, course.title);
  }

  const enrollmentByStudent = new Map(
    (enrollments ?? []).map((row) => [row.student_id, row.course_id])
  );

  const completedByStudent = new Map<string, number>();
  for (const row of progress ?? []) {
    completedByStudent.set(
      row.student_id,
      (completedByStudent.get(row.student_id) ?? 0) + 1
    );
  }

  const quizByStudent = new Map<string, number[]>();
  for (const attempt of attempts ?? []) {
    const scores = quizByStudent.get(attempt.student_id) ?? [];
    scores.push(attempt.score);
    quizByStudent.set(attempt.student_id, scores);
  }

  const gradedByStudent = new Map<string, number>();
  for (const submission of submissions ?? []) {
    if (submission.status === "graded") {
      gradedByStudent.set(
        submission.student_id,
        (gradedByStudent.get(submission.student_id) ?? 0) + 1
      );
    }
  }

  const rows = (students ?? []).map((student) => {
    const courseId = enrollmentByStudent.get(student.id);
    const totalLessons = courseId ? lessonTotals.get(courseId) ?? 0 : 0;
    const completed = completedByStudent.get(student.id) ?? 0;
    const progressPct =
      totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);
    const quizScores = quizByStudent.get(student.id) ?? [];
    const avgQuiz =
      quizScores.length === 0
        ? null
        : Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length);
    return {
      id: student.id,
      name: student.full_name,
      avatar: student.avatar_url,
      course: courseId ? courseTitles.get(courseId) ?? "None" : "Not enrolled",
      progress: progressPct,
      avgQuiz,
      graded: gradedByStudent.get(student.id) ?? 0,
    };
  });

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Insight"
        title="Performance"
        description="Track how every student is progressing across lessons, quizzes and assignments."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No students yet"
          description="Once students are enrolled, their performance appears here."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium">Avg. quiz</th>
                  <th className="px-5 py-3 font-medium">Graded</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} src={row.avatar} size={36} />
                        <span className="font-medium text-ink">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{row.course}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={row.progress} className="w-28" />
                        <span className="text-xs font-medium text-muted">
                          {row.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {row.avgQuiz === null ? (
                        <span className="text-muted">Not yet</span>
                      ) : (
                        <Badge tone={row.avgQuiz >= 70 ? "brand" : "gold"}>
                          {row.avgQuiz}%
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{row.graded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
