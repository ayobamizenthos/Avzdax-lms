import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, ListChecks } from "lucide-react";

import { requireRole } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AddAssignment,
  AddLesson,
  AddModule,
  DeleteModule,
  PublishToggle,
} from "@/components/tutor/builder-forms";
import { QuizEditor } from "@/components/tutor/quiz-editor";
import { LessonManager } from "@/components/tutor/lesson-manager";

export const metadata: Metadata = {
  title: "Course builder",
};

export default async function CourseBuilder({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireRole("tutor", "admin");
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `id, title, summary, is_published,
       modules ( id, title, position,
         lessons ( id, title, youtube_id, body, position, resources ( id, name ) ),
         assignments ( id, title ),
         quizzes ( id, title, pass_score,
           quiz_questions ( id, prompt, options, correct_index, position ) )
       )`
    )
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const modules = (course.modules ?? []).sort((a, b) => a.position - b.position);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={course.is_published ? "Published" : "Draft"}
        title={course.title}
        description={course.summary ?? undefined}
        action={
          <PublishToggle courseId={course.id} published={course.is_published} />
        }
      />

      <div className="space-y-6">
        {modules.map((courseModule, index) => {
          const lessons = (courseModule.lessons ?? []).sort(
            (a, b) => a.position - b.position
          );
          const quiz = courseModule.quizzes?.[0];
          return (
            <Card key={courseModule.id}>
              <CardBody>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg text-ink">
                    Module {index + 1} · {courseModule.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge>{lessons.length} lessons</Badge>
                    <DeleteModule courseId={course.id} moduleId={courseModule.id} />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {lessons.map((lesson) => (
                    <LessonManager
                      key={lesson.id}
                      courseId={course.id}
                      lesson={lesson}
                    />
                  ))}

                  {(courseModule.assignments ?? []).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 rounded-sm border border-line px-3.5 py-2.5 text-sm"
                    >
                      <FileText className="size-4 text-gold" />
                      <span className="flex-1 text-ink">{assignment.title}</span>
                      <Badge tone="gold">Assignment</Badge>
                    </div>
                  ))}

                  {quiz ? (
                    <div className="rounded-sm border border-line px-3.5 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <ListChecks className="size-4 text-brand" />
                        <span className="flex-1 text-ink">{quiz.title}</span>
                        <Badge tone="brand">
                          {quiz.quiz_questions?.length ?? 0} questions
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <QuizEditor
                          courseId={course.id}
                          moduleId={courseModule.id}
                          quiz={{
                            id: quiz.id,
                            title: quiz.title,
                            passScore: quiz.pass_score,
                            questions: [...(quiz.quiz_questions ?? [])]
                              .sort((a, b) => a.position - b.position)
                              .map((question) => ({
                                prompt: question.prompt,
                                options: (question.options as string[]) ?? [],
                                correctIndex: question.correct_index,
                              })),
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {lessons.length === 0 &&
                  (courseModule.assignments ?? []).length === 0 &&
                  !quiz ? (
                    <div className="rounded-sm border border-dashed border-line-strong px-3.5 py-4 text-center text-sm text-muted">
                      Nothing here yet. Add your first lesson.
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <AddLesson courseId={course.id} moduleId={courseModule.id} />
                  <AddAssignment courseId={course.id} moduleId={courseModule.id} />
                  {!quiz ? (
                    <QuizEditor courseId={course.id} moduleId={courseModule.id} />
                  ) : null}
                </div>
              </CardBody>
            </Card>
          );
        })}

        <Card>
          <CardBody>
            <AddModule courseId={course.id} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
