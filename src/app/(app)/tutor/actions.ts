"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseYouTubeId } from "@/lib/youtube";
import { notify, studentsInCourse } from "@/lib/notify";

type ActionResult = { error: string | null };

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role === "student") {
    return { supabase, userId: null };
  }
  return { supabase, userId: user.id };
}

export async function createCourse(formData: FormData): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!title) return { error: "Give the course a title." };

  const { error } = await supabase.from("courses").insert({
    title,
    summary: summary || null,
    created_by: userId,
    tutor_id: userId,
  });
  if (error) return { error: "Could not create the course." };

  revalidatePath("/tutor/courses");
  return { error: null };
}

export async function togglePublish(
  courseId: string,
  publish: boolean
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const { error } = await supabase
    .from("courses")
    .update({ is_published: publish })
    .eq("id", courseId);
  if (error) return { error: "Could not update the course." };

  revalidatePath(`/tutor/courses/${courseId}`);
  revalidatePath("/tutor/courses");
  return { error: null };
}

export async function addModule(
  courseId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Module needs a title." };

  const { count } = await supabase
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { error } = await supabase.from("modules").insert({
    course_id: courseId,
    title,
    position: count ?? 0,
  });
  if (error) return { error: "Could not add the module." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function addLesson(
  courseId: string,
  moduleId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const videoInput = String(formData.get("youtube") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return { error: "Lesson needs a title." };

  const youtubeId = videoInput ? parseYouTubeId(videoInput) : null;
  if (videoInput && !youtubeId) {
    return { error: "That YouTube link doesn't look right." };
  }

  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  const { error } = await supabase.from("lessons").insert({
    module_id: moduleId,
    title,
    youtube_id: youtubeId,
    body: body || null,
    position: count ?? 0,
  });
  if (error) return { error: "Could not add the lesson." };

  const recipients = await studentsInCourse(courseId);
  await notify({
    recipientIds: recipients,
    title: "New lesson published",
    body: title,
    href: "/learn/course",
  });

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function addAssignment(
  courseId: string,
  moduleId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const dueRaw = String(formData.get("due_at") ?? "").trim();
  if (!title) return { error: "Assignment needs a title." };

  const { error } = await supabase.from("assignments").insert({
    module_id: moduleId,
    title,
    instructions: instructions || null,
    due_at: dueRaw ? new Date(dueRaw).toISOString() : null,
  });
  if (error) return { error: "Could not add the assignment." };

  const recipients = await studentsInCourse(courseId);
  await notify({
    recipientIds: recipients,
    title: "New assignment posted",
    body: title,
    href: "/learn/assignments",
  });

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function scheduleClass(
  courseId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const teamsUrl = String(formData.get("teams_url") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "").trim();
  const duration = Number(formData.get("duration") ?? 60);
  if (!title || !teamsUrl || !startsAt) {
    return { error: "Fill in the title, link and start time." };
  }

  const { error } = await supabase.from("class_sessions").insert({
    course_id: courseId,
    title,
    teams_url: teamsUrl,
    starts_at: new Date(startsAt).toISOString(),
    duration_minutes: Number.isFinite(duration) ? duration : 60,
  });
  if (error) return { error: "Could not schedule the class." };

  const recipients = await studentsInCourse(courseId);
  await notify({
    recipientIds: recipients,
    title: "Live class scheduled",
    body: title,
    href: "/learn/classes",
  });

  revalidatePath("/tutor/classes");
  return { error: null };
}

export async function updateClass(
  classId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const teamsUrl = String(formData.get("teams_url") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "").trim();
  const duration = Number(formData.get("duration") ?? 60);
  if (!title || !teamsUrl || !startsAt) {
    return { error: "Fill in the title, link and start time." };
  }

  const { error } = await supabase
    .from("class_sessions")
    .update({
      title,
      teams_url: teamsUrl,
      starts_at: new Date(startsAt).toISOString(),
      duration_minutes: Number.isFinite(duration) ? duration : 60,
    })
    .eq("id", classId);
  if (error) return { error: "Could not update the class." };

  revalidatePath("/tutor/classes");
  return { error: null };
}

export async function deleteClass(classId: string): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const { error } = await supabase
    .from("class_sessions")
    .delete()
    .eq("id", classId);
  if (error) return { error: "Could not delete the class." };

  revalidatePath("/tutor/classes");
  return { error: null };
}

type QuizQuestionInput = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type PreparedQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

function prepareQuestions(
  raw: QuizQuestionInput[]
): { error: string } | { questions: PreparedQuestion[] } {
  const prepared: PreparedQuestion[] = [];

  for (const question of raw) {
    const prompt = question.prompt.trim();
    const kept = question.options
      .map((option, index) => ({ option: option.trim(), index }))
      .filter((entry) => entry.option.length > 0);

    if (!prompt && kept.length === 0) continue;
    if (!prompt) return { error: "Every question needs a prompt." };
    if (kept.length < 2) return { error: "Every question needs at least two options." };

    const correctIndex = kept.findIndex((entry) => entry.index === question.correctIndex);
    if (correctIndex < 0) {
      return { error: "Mark the correct answer for every question." };
    }

    prepared.push({
      prompt,
      options: kept.map((entry) => entry.option),
      correctIndex,
    });
  }

  if (prepared.length === 0) return { error: "Add at least one complete question." };
  return { questions: prepared };
}

function resolvePassScore(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.min(100, value) : 70;
}

async function writeQuestions(
  supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"],
  quizId: string,
  questions: PreparedQuestion[]
) {
  return supabase.from("quiz_questions").insert(
    questions.map((question, index) => ({
      quiz_id: quizId,
      prompt: question.prompt,
      options: question.options,
      correct_index: question.correctIndex,
      position: index,
    }))
  );
}

export async function createQuiz(
  courseId: string,
  moduleId: string,
  input: { title: string; passScore: number; questions: QuizQuestionInput[] }
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = input.title.trim();
  if (!title) return { error: "Give the quiz a title." };

  const prepared = prepareQuestions(input.questions);
  if ("error" in prepared) return { error: prepared.error };

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({ module_id: moduleId, title, pass_score: resolvePassScore(input.passScore) })
    .select()
    .single();
  if (error || !quiz) return { error: "Could not create the quiz." };

  const { error: questionError } = await writeQuestions(supabase, quiz.id, prepared.questions);
  if (questionError) return { error: "Could not save the questions." };

  const recipients = await studentsInCourse(courseId);
  await notify({
    recipientIds: recipients,
    title: "New quiz available",
    body: title,
    href: "/learn/course",
  });

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function updateQuiz(
  courseId: string,
  quizId: string,
  input: { title: string; passScore: number; questions: QuizQuestionInput[] }
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = input.title.trim();
  if (!title) return { error: "Give the quiz a title." };

  const prepared = prepareQuestions(input.questions);
  if ("error" in prepared) return { error: prepared.error };

  const { error: quizError } = await supabase
    .from("quizzes")
    .update({ title, pass_score: resolvePassScore(input.passScore) })
    .eq("id", quizId);
  if (quizError) return { error: "Could not update the quiz." };

  const { error: deleteError } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("quiz_id", quizId);
  if (deleteError) return { error: "Could not update the questions." };

  const { error: questionError } = await writeQuestions(supabase, quizId, prepared.questions);
  if (questionError) return { error: "Could not save the questions." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function deleteQuiz(
  courseId: string,
  quizId: string
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
  if (error) return { error: "Could not delete the quiz." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const title = String(formData.get("title") ?? "").trim();
  const videoInput = String(formData.get("youtube") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return { error: "Lesson needs a title." };

  const youtubeId = videoInput ? parseYouTubeId(videoInput) : null;
  if (videoInput && !youtubeId) {
    return { error: "That YouTube link doesn't look right." };
  }

  const { error } = await supabase
    .from("lessons")
    .update({ title, youtube_id: youtubeId, body: body || null })
    .eq("id", lessonId);
  if (error) return { error: "Could not update the lesson." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function deleteLesson(
  courseId: string,
  lessonId: string
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: "Could not delete the lesson." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function deleteModule(
  courseId: string,
  moduleId: string
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) return { error: "Could not delete the module." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function deleteResource(
  courseId: string,
  resourceId: string
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);
  if (error) return { error: "Could not delete the material." };

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function addResource(
  courseId: string,
  lessonId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const file = formData.get("file");
  const providedName = String(formData.get("name") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const path = `${lessonId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("resources")
    .upload(path, file, { upsert: true });
  if (uploadError) return { error: "Upload failed. Try a smaller file." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("resources").getPublicUrl(path);

  const { error } = await supabase.from("resources").insert({
    lesson_id: lessonId,
    name: providedName || file.name,
    file_url: publicUrl,
  });
  if (error) return { error: "Could not save the resource." };

  const recipients = await studentsInCourse(courseId);
  await notify({
    recipientIds: recipients,
    title: "New material uploaded",
    body: providedName || file.name,
    href: "/learn/course",
  });

  revalidatePath(`/tutor/courses/${courseId}`);
  return { error: null };
}

export async function gradeSubmission(
  submissionId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireStaff();
  if (!userId) return { error: "Not authorised." };

  const score = Number(formData.get("score"));
  const feedback = String(formData.get("feedback") ?? "").trim();
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return { error: "Score must be between 0 and 100." };
  }

  const { data: updated, error } = await supabase
    .from("submissions")
    .update({
      score,
      feedback: feedback || null,
      status: "graded",
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select("student_id, assignment_id")
    .single();
  if (error || !updated) return { error: "Could not save the grade." };

  await notify({
    recipientIds: [updated.student_id],
    title: "Assignment graded",
    body: `You scored ${score}%`,
    href: "/learn/assignments",
  });

  revalidatePath("/tutor/submissions");
  return { error: null };
}
