import { readFileSync } from "node:fs";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { createClient } from "@supabase/supabase-js";

import { courses } from "./course-content.mjs";

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup(hostname, options, callback) {
        if (hostname === "qvrehedvcmfawcyfgqgr.supabase.co") {
          callback(null, [{ address: "172.64.149.246", family: 4 }]);
          return;
        }
        dns.lookup(hostname, options, callback);
      },
    },
  })
);

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function shuffleOptions(options, correctIndex) {
  const paired = options.map((option, index) => ({ option, correct: index === correctIndex }));
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  return {
    options: paired.map((entry) => entry.option),
    correct_index: paired.findIndex((entry) => entry.correct),
  };
}

for (const course of courses) {
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("title", course.title)
    .maybeSingle();

  if (!existing) {
    console.log(`SKIP (not found): ${course.title}`);
    continue;
  }

  await supabase.from("courses").update({ summary: course.summary }).eq("id", existing.id);
  await supabase.from("modules").delete().eq("course_id", existing.id);

  let modulePosition = 0;
  for (const unit of course.modules) {
    const { data: moduleRow } = await supabase
      .from("modules")
      .insert({ course_id: existing.id, title: unit.title, position: modulePosition++ })
      .select()
      .single();

    let lessonPosition = 0;
    for (const lesson of unit.lessons) {
      await supabase.from("lessons").insert({
        module_id: moduleRow.id,
        title: lesson.title,
        youtube_id: lesson.youtube_id,
        body: lesson.body,
        position: lessonPosition++,
      });
    }

    if (unit.quiz) {
      const { data: quizRow } = await supabase
        .from("quizzes")
        .insert({ module_id: moduleRow.id, title: unit.quiz.title, pass_score: 70 })
        .select()
        .single();
      let questionPosition = 0;
      for (const question of unit.quiz.questions) {
        const shuffled = shuffleOptions(question.options, question.correct_index);
        await supabase.from("quiz_questions").insert({
          quiz_id: quizRow.id,
          prompt: question.prompt,
          options: shuffled.options,
          correct_index: shuffled.correct_index,
          position: questionPosition++,
        });
      }
    }

    if (unit.assignment) {
      await supabase.from("assignments").insert({
        module_id: moduleRow.id,
        title: unit.assignment.title,
        instructions: unit.assignment.instructions,
        due_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      });
    }
  }

  console.log(`refreshed: ${course.title} (${course.modules.length} modules)`);
}

console.log("content refresh complete");
