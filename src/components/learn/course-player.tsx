"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  Circle,
  CircleCheck,
  FileText,
  ListChecks,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { YouTubePlayer } from "@/components/learn/youtube-player";
import { QuizRunner } from "@/components/learn/quiz-runner";
import { markLessonComplete } from "@/app/(app)/learn/course/actions";
import type { CourseTree, LessonNode } from "@/lib/data/student";

type Selection =
  | { kind: "lesson"; id: string }
  | { kind: "quiz"; id: string };

export function CoursePlayer({ course }: { course: CourseTree }) {
  const allLessons = useMemo(
    () => course.modules.flatMap((unit) => unit.lessons),
    [course]
  );

  const [selection, setSelection] = useState<Selection | null>(() => {
    const firstIncomplete = allLessons.find((lesson) => !lesson.completed);
    const target = firstIncomplete ?? allLessons[0];
    return target ? { kind: "lesson", id: target.id } : null;
  });
  const [pending, startTransition] = useTransition();

  const currentLesson =
    selection?.kind === "lesson"
      ? allLessons.find((lesson) => lesson.id === selection.id) ??
        allLessons[0] ??
        null
      : null;
  const currentQuizModule =
    selection?.kind === "quiz"
      ? course.modules.find((unit) => unit.quiz?.id === selection.id) ?? null
      : null;

  function toggleComplete(lesson: LessonNode) {
    setSelection({ kind: "lesson", id: lesson.id });
    startTransition(async () => {
      await markLessonComplete(lesson.id, !lesson.completed);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        {currentLesson ? (
          <LessonView
            lesson={currentLesson}
            pending={pending}
            onToggle={() => toggleComplete(currentLesson)}
          />
        ) : currentQuizModule?.quiz ? (
          <QuizRunner
            key={currentQuizModule.quiz.id}
            quizId={currentQuizModule.quiz.id}
            title={currentQuizModule.quiz.title}
            passScore={currentQuizModule.quiz.pass_score}
          />
        ) : (
          <p className="text-muted">This course has no lessons yet.</p>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-lg border border-line bg-surface shadow-card">
          <div className="border-b border-line p-4">
            <p className="text-sm font-semibold text-ink">Syllabus</p>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={course.progress} className="flex-1" />
              <span className="text-xs font-medium text-muted">
                {Math.round(course.progress)}%
              </span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto overscroll-contain scroll-smooth p-2 lg:max-h-[calc(100vh-11rem)]">
            {course.modules.map((unit, index) => (
              <div key={unit.id} className="mb-2">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  {index + 1}. {unit.title}
                </p>
                <ul>
                  {unit.lessons.map((lesson) => {
                    const isActive =
                      selection?.kind === "lesson" &&
                      selection.id === lesson.id;
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelection({ kind: "lesson", id: lesson.id })
                          }
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "bg-brand-tint text-brand-deep"
                              : "text-ink-soft hover:bg-ink/[0.04]"
                          )}
                        >
                          {lesson.completed ? (
                            <CircleCheck className="size-4 shrink-0 text-brand" />
                          ) : (
                            <Circle className="size-4 shrink-0 text-line-strong" />
                          )}
                          <span className="line-clamp-2">{lesson.title}</span>
                        </button>
                      </li>
                    );
                  })}
                  {unit.quiz ? (
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setSelection({ kind: "quiz", id: unit.quiz!.id })
                        }
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                          selection?.kind === "quiz" &&
                            selection.id === unit.quiz.id
                            ? "bg-brand-tint text-brand-deep"
                            : "text-ink-soft hover:bg-ink/[0.04]"
                        )}
                      >
                        <ListChecks className="size-4 shrink-0 text-gold" />
                        <span className="flex-1">{unit.quiz.title}</span>
                        {unit.bestScore !== null ? (
                          <span className="text-xs font-semibold text-brand">
                            {unit.bestScore}%
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function LessonView({
  lesson,
  pending,
  onToggle,
}: {
  lesson: LessonNode;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="animate-rise space-y-5">
      {lesson.youtube_id ? (
        <YouTubePlayer youtubeId={lesson.youtube_id} title={lesson.title} />
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          {lesson.completed ? (
            <Badge tone="brand">Completed</Badge>
          ) : (
            <Badge>In progress</Badge>
          )}
          <h1 className="mt-2 font-display text-2xl text-ink">{lesson.title}</h1>
        </div>
        <Button
          variant={lesson.completed ? "secondary" : "primary"}
          onClick={onToggle}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : lesson.completed ? (
            "Mark incomplete"
          ) : (
            <>
              <Check className="size-4" />
              Mark complete
            </>
          )}
        </Button>
      </div>

      {lesson.body ? (
        <div className="whitespace-pre-line text-[0.98rem] leading-relaxed text-ink-soft">
          {lesson.body}
        </div>
      ) : null}

      {lesson.resources.length > 0 ? (
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-ink">Lesson resources</p>
          <ul className="mt-3 space-y-2">
            {lesson.resources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-sm border border-line px-3 py-2.5 text-sm text-ink-soft transition-colors hover:border-brand hover:text-brand"
                >
                  <FileText className="size-4" />
                  {resource.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
