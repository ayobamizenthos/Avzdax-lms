"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnrolledCourse } from "@/lib/data/student";

function makeSerial() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AVZ-${new Date().getFullYear()}-${random}`;
}

export async function issueCertificate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const course = await getEnrolledCourse(user.id);
  if (!course) return { error: "No course found." };
  if (course.progress < 100) {
    return { error: "Finish every lesson to unlock your certificate." };
  }

  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!existing) {
    const admin = createAdminClient();
    await admin.from("certificates").insert({
      student_id: user.id,
      course_id: course.id,
      serial: makeSerial(),
    });
    await admin
      .from("enrollments")
      .update({ status: "completed" })
      .eq("student_id", user.id)
      .eq("course_id", course.id);
  }

  revalidatePath("/learn/certificate");
  return { error: null };
}
