"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function markLessonComplete(lessonId: string, completed: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  if (completed) {
    await supabase
      .from("lesson_progress")
      .upsert(
        { student_id: user.id, lesson_id: lessonId },
        { onConflict: "student_id,lesson_id" }
      );
  } else {
    await supabase
      .from("lesson_progress")
      .delete()
      .eq("student_id", user.id)
      .eq("lesson_id", lessonId);
  }

  revalidatePath("/learn/course");
  revalidatePath("/learn");
  return { error: null };
}

export async function getQuizQuestions(quizId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("id, prompt, options, position")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  return (data ?? []).map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: (question.options as string[]) ?? [],
  }));
}

export async function submitQuiz(quizId: string, answers: number[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", score: 0 };

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, prompt, options, correct_index, position")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  if (!questions || questions.length === 0) {
    return { error: "This quiz has no questions yet.", score: 0, review: [] };
  }

  const correct = questions.reduce(
    (total, question, index) =>
      answers[index] === question.correct_index ? total + 1 : total,
    0
  );
  const score = Math.round((correct / questions.length) * 100);

  await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    student_id: user.id,
    score,
    answers,
  });

  const review = questions.map((question, index) => ({
    prompt: question.prompt,
    options: (question.options as string[]) ?? [],
    correctIndex: question.correct_index,
    chosenIndex: answers[index],
  }));

  revalidatePath("/learn/course");
  return { error: null, score, review };
}
