"use client";

import { useState, useTransition } from "react";
import { Check, ListChecks, Loader2, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createQuiz } from "@/app/(app)/tutor/actions";

type DraftQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

function emptyQuestion(): DraftQuestion {
  return { prompt: "", options: ["", "", "", ""], correctIndex: 0 };
}

export function QuizBuilder({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [passScore, setPassScore] = useState(70);
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((question, i) => (i === index ? { ...question, ...patch } : question))
    );
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === qIndex
          ? {
              ...question,
              options: question.options.map((option, j) =>
                j === oIndex ? value : option
              ),
            }
          : question
      )
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await createQuiz(courseId, moduleId, {
        title,
        passScore,
        questions,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setTitle("");
        setPassScore(70);
        setQuestions([emptyQuestion()]);
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        <ListChecks className="size-4" />
        Add quiz
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-sm border border-line bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <Field label="Quiz title">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Module 1 Check"
          />
        </Field>
        <Field label="Pass mark %">
          <Input
            type="number"
            min={1}
            max={100}
            value={passScore}
            onChange={(event) => setPassScore(Number(event.target.value))}
          />
        </Field>
      </div>

      {questions.map((question, qIndex) => (
        <div key={qIndex} className="rounded-sm border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Question {qIndex + 1}</p>
            {questions.length > 1 ? (
              <button
                onClick={() =>
                  setQuestions((prev) => prev.filter((_, i) => i !== qIndex))
                }
                className="text-muted hover:text-danger"
                aria-label="Remove question"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>
          <Input
            className="mt-3"
            value={question.prompt}
            onChange={(event) =>
              updateQuestion(qIndex, { prompt: event.target.value })
            }
            placeholder="Question prompt"
          />
          <div className="mt-3 space-y-2">
            {question.options.map((option, oIndex) => {
              const correct = question.correctIndex === oIndex;
              return (
                <div key={oIndex} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(qIndex, { correctIndex: oIndex })
                    }
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                      correct
                        ? "border-brand bg-brand text-brand-ink"
                        : "border-line-strong text-muted hover:border-brand"
                    )}
                    aria-label={`Mark option ${oIndex + 1} correct`}
                  >
                    {correct ? (
                      <Check className="size-3.5" />
                    ) : (
                      String.fromCharCode(65 + oIndex)
                    )}
                  </button>
                  <Input
                    value={option}
                    onChange={(event) =>
                      updateOption(qIndex, oIndex, event.target.value)
                    }
                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Tap a letter to mark the correct answer.
          </p>
        </div>
      ))}

      <button
        onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        <Plus className="size-4" />
        Add another question
      </button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Save quiz"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
