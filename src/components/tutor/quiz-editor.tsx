"use client";

import { useState, useTransition } from "react";
import {
  Check,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createQuiz, deleteQuiz, updateQuiz } from "@/app/(app)/tutor/actions";

type DraftQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type ExistingQuiz = {
  id: string;
  title: string;
  passScore: number;
  questions: DraftQuestion[];
};

function emptyQuestion(): DraftQuestion {
  return { prompt: "", options: ["", "", "", ""], correctIndex: -1 };
}

const CSV_TEMPLATE =
  "data:text/csv;charset=utf-8," +
  encodeURIComponent(
    "Question,Option A,Option B,Option C,Option D,Correct Answer\n" +
      '"What is 2 + 2?","3","4","5","6",B\n' +
      '"Capital of France?","Paris","Lagos","Rome","Cairo",A\n'
  );

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsToQuestions(rows: string[][]): DraftQuestion[] {
  const questions: DraftQuestion[] = [];
  for (const raw of rows) {
    const cells = raw.map((cell) => (cell ?? "").trim());
    if (cells.every((cell) => !cell)) continue;
    const [prompt, a, b, c, d, correct] = cells;
    if (/^question$/i.test(prompt)) continue;
    if (!prompt) continue;

    const options = [a ?? "", b ?? "", c ?? "", d ?? ""];
    const letter = (correct ?? "").toUpperCase();
    let correctIndex = ["A", "B", "C", "D"].indexOf(letter);
    if (correctIndex < 0) {
      correctIndex = options.findIndex(
        (option) => option && option.toLowerCase() === (correct ?? "").toLowerCase()
      );
    }
    questions.push({ prompt, options, correctIndex });
  }
  return questions;
}

export function QuizEditor({
  courseId,
  moduleId,
  quiz,
}: {
  courseId: string;
  moduleId: string;
  quiz?: ExistingQuiz;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [passScore, setPassScore] = useState(quiz?.passScore ?? 70);
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    quiz?.questions.length ? quiz.questions : [emptyQuestion()]
  );
  const [error, setError] = useState<string | null>(null);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleCsv(file: File) {
    setImportNote(null);
    setError(null);
    try {
      const parsed = rowsToQuestions(parseCsvRows(await file.text()));
      if (parsed.length === 0) {
        setError("No questions found. Check the file matches the template.");
        return;
      }
      setQuestions(parsed);
      const missing = parsed.filter((question) => question.correctIndex < 0).length;
      setImportNote(
        `Loaded ${parsed.length} question${parsed.length === 1 ? "" : "s"}.` +
          (missing > 0
            ? ` ${missing} need a correct answer marked before saving.`
            : " Review and save.")
      );
    } catch {
      setError("Could not read that file. Please upload a valid CSV.");
    }
  }

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
      const payload = { title, passScore, questions };
      const result = quiz
        ? await updateQuiz(courseId, quiz.id, payload)
        : await createQuiz(courseId, moduleId, payload);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setOpen(false);
        if (!quiz) {
          setTitle("");
          setPassScore(70);
          setQuestions([emptyQuestion()]);
        }
      }
    });
  }

  function removeQuiz() {
    if (!quiz) return;
    startTransition(async () => {
      await deleteQuiz(courseId, quiz.id);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        {quiz ? <Pencil className="size-4" /> : <ListChecks className="size-4" />}
        {quiz ? "Edit quiz" : "Add quiz"}
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

      <div className="rounded-sm border border-dashed border-line-strong bg-surface p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-brand hover:underline">
            <Upload className="size-4" />
            Bulk upload questions (CSV)
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCsv(file);
                event.target.value = "";
              }}
            />
          </label>
          <a
            href={CSV_TEMPLATE}
            download="quiz-template.csv"
            className="text-xs font-medium text-muted hover:text-ink hover:underline"
          >
            Download template
          </a>
        </div>
        <div className="mt-1.5 text-xs text-muted">
          <p className="font-medium text-ink-soft">
            Prefer to add many questions at once? Upload a CSV instead of typing.
          </p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
            <li>Click Download template and open it in Excel or Google Sheets.</li>
            <li>
              Fill each row: Question, Option A, B, C, D, and the Correct Answer
              (just the letter A, B, C or D).
            </li>
            <li>Save as CSV, then upload it here. Questions fill in with the correct
              answer already marked. Review and save.</li>
          </ol>
          <p className="mt-1">Uploading replaces the questions below.</p>
        </div>
        {importNote ? (
          <p className="mt-1 text-xs font-medium text-brand">{importNote}</p>
        ) : null}
      </div>

      {questions.map((question, qIndex) => (
        <div key={qIndex} className="rounded-sm border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Question {qIndex + 1}</p>
            {questions.length > 1 ? (
              <button
                type="button"
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

          <p className="mt-3 text-xs font-medium text-ink-soft">
            Answer options — click the circle to mark the correct answer
          </p>
          <div className="mt-1.5 space-y-2">
            {question.options.map((option, oIndex) => {
              const correct = question.correctIndex === oIndex;
              return (
                <div key={oIndex} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                      correct
                        ? "border-brand bg-brand text-brand-ink"
                        : "border-line-strong text-muted hover:border-brand"
                    )}
                    aria-label={`Mark option ${String.fromCharCode(65 + oIndex)} correct`}
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
                  {correct ? (
                    <span className="shrink-0 text-xs font-medium text-brand">
                      Correct
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          {question.correctIndex < 0 ? (
            <p className="mt-2 text-xs text-danger">
              Mark the correct answer for this question.
            </p>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        className="flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        <Plus className="size-4" />
        Add another question
      </button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : quiz ? (
            "Save changes"
          ) : (
            "Save quiz"
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {quiz ? (
          confirming ? (
            <span className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={removeQuiz}
                className="rounded-sm bg-danger px-2.5 py-1.5 text-xs font-medium text-white"
              >
                {pending ? "…" : "Delete quiz"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-xs text-muted hover:text-ink"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="ml-auto flex items-center gap-1.5 text-sm font-medium text-muted hover:text-danger"
            >
              <Trash2 className="size-4" />
              Delete quiz
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
