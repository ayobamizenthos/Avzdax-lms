"use client";

import { useEffect, useState } from "react";
import { Award, Check, Loader2, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  getQuizQuestions,
  submitQuiz,
} from "@/app/(app)/learn/course/actions";

type Question = { id: string; prompt: string; options: string[] };
type ReviewItem = {
  prompt: string;
  options: string[];
  correctIndex: number;
  chosenIndex: number;
};

export function QuizRunner({
  quizId,
  title,
  passScore,
}: {
  quizId: string;
  title: string;
  passScore: number;
}) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getQuizQuestions(quizId).then((data) => {
      if (active) setQuestions(data);
    });
    return () => {
      active = false;
    };
  }, [quizId]);

  if (!questions) {
    return (
      <div className="grid h-64 place-items-center text-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (result !== null) {
    const passed = result >= passScore;
    const correctCount = review.filter(
      (item) => item.chosenIndex === item.correctIndex
    ).length;
    return (
      <div className="animate-rise space-y-6">
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <span
            className={cn(
              "mx-auto grid size-16 place-items-center rounded-full",
              passed ? "bg-brand-tint text-brand" : "bg-danger-tint text-danger"
            )}
          >
            <Award className="size-8" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 font-display text-2xl text-ink">
            {passed ? "Module passed" : "Not quite there"}
          </h2>
          <p className="mt-1 text-ink-soft">
            You scored <span className="font-semibold text-ink">{result}%</span>{" "}
            ({correctCount} of {review.length} correct). Pass mark is {passScore}%.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => {
              setResult(null);
              setReview([]);
              setAnswers({});
            }}
          >
            <RotateCcw className="size-4" />
            Retake quiz
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-lg text-ink">Review your answers</h3>
          {review.map((item, index) => {
            const wasCorrect = item.chosenIndex === item.correctIndex;
            return (
              <div
                key={index}
                className="rounded-lg border border-line bg-surface p-5"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white",
                      wasCorrect ? "bg-brand" : "bg-danger"
                    )}
                  >
                    {wasCorrect ? (
                      <Check className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </span>
                  <p className="font-medium text-ink">
                    {index + 1}. {item.prompt}
                  </p>
                </div>
                <div className="mt-3 space-y-2 pl-7">
                  {item.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === item.correctIndex;
                    const isChosen = optionIndex === item.chosenIndex;
                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          "flex items-center justify-between rounded-sm border px-3.5 py-2 text-sm",
                          isCorrect
                            ? "border-brand bg-brand-tint text-brand-deep"
                            : isChosen
                              ? "border-danger bg-danger-tint text-danger"
                              : "border-line text-ink-soft"
                        )}
                      >
                        <span>{option}</span>
                        {isCorrect ? (
                          <span className="text-xs font-semibold">
                            Correct answer
                          </span>
                        ) : isChosen ? (
                          <span className="text-xs font-semibold">
                            Your answer
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const allAnswered = questions.every((_, index) => answers[index] !== undefined);

  async function handleSubmit() {
    setSubmitting(true);
    const ordered = questions!.map((_, index) => answers[index]);
    const outcome = await submitQuiz(quizId, ordered);
    setSubmitting(false);
    setReview(outcome.review ?? []);
    setResult(outcome.score);
  }

  return (
    <div className="animate-rise space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted">
          {questions.length} questions · pass mark {passScore}%
        </p>
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          className="rounded-lg border border-line bg-surface p-5"
        >
          <p className="font-medium text-ink">
            {index + 1}. {question.prompt}
          </p>
          <div className="mt-3 space-y-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex;
              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm border px-3.5 py-2.5 text-left text-sm transition-colors",
                    selected
                      ? "border-brand bg-brand-tint text-brand-deep"
                      : "border-line text-ink-soft hover:border-line-strong"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                      selected
                        ? "border-brand bg-brand text-brand-ink"
                        : "border-line-strong text-muted"
                    )}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : "Submit quiz"}
      </Button>
    </div>
  );
}
