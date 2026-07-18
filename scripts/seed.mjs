import { readFileSync } from "node:fs";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { createClient } from "@supabase/supabase-js";

import { courses } from "./course-content.mjs";

const pinnedHosts = {
  "qvrehedvcmfawcyfgqgr.supabase.co": "172.64.149.246",
};

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup(hostname, options, callback) {
        const pinned = pinnedHosts[hostname];
        if (pinned) {
          callback(null, [{ address: pinned, family: 4 }]);
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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const password = "Academy2026!";

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

const staff = [
  { key: "admin", email: "admin@avzdax.com", full_name: "Ayobami Zenthos", role: "admin" },
  { key: "cv", email: "tutor.vision@avzdax.com", full_name: "Ngozi Okafor", role: "tutor" },
  { key: "cyber", email: "tutor.security@avzdax.com", full_name: "Emeka Nwosu", role: "tutor" },
  { key: "backend", email: "tutor.backend@avzdax.com", full_name: "Tunde Adeyemi", role: "tutor" },
  { key: "data", email: "tutor.data@avzdax.com", full_name: "Fatima Bello", role: "tutor" },
  { key: "foundations", email: "tutor.foundations@avzdax.com", full_name: "Chidi Okonkwo", role: "tutor" },
];

async function upsertUser(person) {
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const found = existing.users.find((user) => user.email === person.email);
  if (found) {
    await supabase.auth.admin.updateUserById(found.id, {
      password,
      user_metadata: { full_name: person.full_name, role: person.role },
    });
    await supabase.from("profiles").upsert({
      id: found.id,
      email: person.email,
      full_name: person.full_name,
      role: person.role,
    });
    return found.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email: person.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: person.full_name, role: person.role },
  });
  if (error) throw error;
  await supabase.from("profiles").upsert({
    id: data.user.id,
    email: person.email,
    full_name: person.full_name,
    role: person.role,
  });
  return data.user.id;
}

async function main() {
  if (process.env.SEED_RESET !== "yes") {
    console.error(
      "Refusing to run. This script deletes every course, submission and notification,\n" +
        "then recreates demo accounts. The platform is live.\n" +
        "Run with SEED_RESET=yes only against a throwaway database."
    );
    process.exit(1);
  }

  const ids = {};
  for (const person of staff) {
    ids[person.key] = await upsertUser(person);
    console.log(`user ready: ${person.email}`);
  }

  await supabase.from("submissions").delete().not("id", "is", null);
  await supabase.from("notifications").delete().not("id", "is", null);
  await supabase.from("courses").delete().not("id", "is", null);

  const courseIdByTitle = {};

  for (const course of courses) {
    const { data: courseRow } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        summary: course.summary,
        created_by: ids[course.tutorKey],
        tutor_id: ids[course.tutorKey],
        is_published: true,
      })
      .select()
      .single();
    courseIdByTitle[course.title] = courseRow.id;

    let modulePosition = 0;
    for (const unit of course.modules) {
      const { data: moduleRow } = await supabase
        .from("modules")
        .insert({ course_id: courseRow.id, title: unit.title, position: modulePosition++ })
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

    await supabase.from("class_sessions").insert({
      course_id: courseRow.id,
      title: `${course.title} · Live Kickoff`,
      teams_url: "https://teams.microsoft.com/l/meetup-join/avzdax-kickoff",
      starts_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      duration_minutes: 90,
    });

    console.log(`course ready: ${course.title}`);
  }

  const learners = [
    { email: "student@avzdax.com", full_name: "Chiamaka Eze", course: "Backend Development" },
    { email: "student.vision@avzdax.com", full_name: "Zainab Yusuf", course: "Computer Vision" },
    { email: "student.security@avzdax.com", full_name: "David Okoro", course: "Backend Security" },
    { email: "student.backend@avzdax.com", full_name: "Grace Adeyinka", course: "Backend Development" },
    { email: "student.data@avzdax.com", full_name: "Ibrahim Sani", course: "Data Intelligence" },
    { email: "student.foundations@avzdax.com", full_name: "Amara Nwachukwu", course: "AVZDAX Foundations Programme" },
  ];

  for (const learner of learners) {
    const learnerId = await upsertUser({
      email: learner.email,
      full_name: learner.full_name,
      role: "student",
    });
    await supabase.from("enrollments").upsert(
      { student_id: learnerId, course_id: courseIdByTitle[learner.course], status: "active" },
      { onConflict: "student_id,course_id" }
    );
    await supabase.from("notifications").insert({
      recipient_id: learnerId,
      title: "Welcome to Avzdax Academy",
      body: `Your ${learner.course} course is ready. Head to your dashboard to begin.`,
      href: "/learn/course",
    });
    console.log(`student ready: ${learner.email} (${learner.course})`);
  }

  console.log("seed complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
