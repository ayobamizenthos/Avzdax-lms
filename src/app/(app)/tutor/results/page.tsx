import type { Metadata } from "next";
import { format } from "date-fns";
import { BarChart3 } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Assessments",
};

type AttemptRow = {
  id: string;
  score: number;
  submitted_at: string;
  student: { full_name: string; avatar_url: string | null } | null;
  quiz: { title: string; pass_score: number } | null;
};

export default async function TutorResultsPage() {
  await requireRole("tutor", "admin");
  const supabase = await createClient();

  const { data } = await supabase
    .from("quiz_attempts")
    .select(
      `id, score, submitted_at,
       student:profiles!quiz_attempts_student_id_fkey ( full_name, avatar_url ),
       quiz:quizzes ( title, pass_score )`
    )
    .order("submitted_at", { ascending: false });

  const attempts = (data ?? []) as unknown as AttemptRow[];

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Assessments"
        title="Quiz results"
        description="Every quiz attempt from students in your courses, newest first."
      />

      {attempts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No attempts yet"
          description="When your students take a quiz, their results appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Quiz</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Taken</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const passed =
                    attempt.quiz && attempt.score >= attempt.quiz.pass_score;
                  return (
                    <tr key={attempt.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={attempt.student?.full_name ?? "Student"}
                            src={attempt.student?.avatar_url}
                            size={34}
                          />
                          <span className="font-medium text-ink">
                            {attempt.student?.full_name ?? "Student"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink-soft">
                        {attempt.quiz?.title ?? "Quiz"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={passed ? "brand" : "danger"}>
                          {attempt.score}%
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {format(new Date(attempt.submitted_at), "MMM d, h:mm a")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
