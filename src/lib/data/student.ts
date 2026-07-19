import { createClient } from "@/lib/supabase/server";

export type LessonNode = {
  id: string;
  title: string;
  youtube_id: string | null;
  body: string | null;
  position: number;
  completed: boolean;
  locked: boolean;
  resources: { id: string; name: string; file_url: string }[];
};

export type ModuleNode = {
  id: string;
  title: string;
  position: number;
  locked: boolean;
  lessons: LessonNode[];
  quiz: { id: string; title: string; pass_score: number } | null;
  bestScore: number | null;
};

export type CourseTree = {
  id: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
  modules: ModuleNode[];
  totalLessons: number;
  completedLessons: number;
  progress: number;
};

export async function getEnrolledCourse(
  studentId: string
): Promise<CourseTree | null> {
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", studentId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrollment) return null;

  const { data: course } = await supabase
    .from("courses")
    .select(
      `id, title, summary, cover_url,
       modules (
         id, title, position, is_locked,
         lessons ( id, title, youtube_id, body, position, is_locked, resources ( id, name, file_url ) ),
         quizzes ( id, title, pass_score )
       )`
    )
    .eq("id", enrollment.course_id)
    .single();

  if (!course) return null;

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", studentId);

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score")
    .eq("student_id", studentId);

  const completed = new Set((progressRows ?? []).map((row) => row.lesson_id));
  const bestByQuiz = new Map<string, number>();
  for (const attempt of attempts ?? []) {
    const current = bestByQuiz.get(attempt.quiz_id) ?? 0;
    if (attempt.score > current) bestByQuiz.set(attempt.quiz_id, attempt.score);
  }

  const modules: ModuleNode[] = (course.modules ?? [])
    .sort((a, b) => a.position - b.position)
    .map((unit) => {
      const quiz = unit.quizzes?.[0] ?? null;
      const moduleLocked = unit.is_locked;
      return {
        id: unit.id,
        title: unit.title,
        position: unit.position,
        locked: moduleLocked,
        quiz: quiz ? { id: quiz.id, title: quiz.title, pass_score: quiz.pass_score } : null,
        bestScore: quiz ? bestByQuiz.get(quiz.id) ?? null : null,
        lessons: (unit.lessons ?? [])
          .sort((a, b) => a.position - b.position)
          .map((lesson) => {
            const locked = moduleLocked || lesson.is_locked;
            return {
              id: lesson.id,
              title: lesson.title,
              youtube_id: locked ? null : lesson.youtube_id,
              body: locked ? null : lesson.body,
              position: lesson.position,
              completed: completed.has(lesson.id),
              locked,
              resources: locked ? [] : lesson.resources ?? [],
            };
          }),
      };
    });

  const unlockedLessons = modules.flatMap((m) => m.lessons.filter((l) => !l.locked));
  const totalLessons = unlockedLessons.length;
  const completedLessons = unlockedLessons.filter((l) => l.completed).length;

  return {
    id: course.id,
    title: course.title,
    summary: course.summary,
    cover_url: course.cover_url,
    modules,
    totalLessons,
    completedLessons,
    progress: totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100,
  };
}
