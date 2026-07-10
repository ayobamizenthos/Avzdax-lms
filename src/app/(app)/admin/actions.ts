"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";
import type { Role } from "@/lib/session";

type ActionResult = { error: string | null };

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin";
}

function randomPassword() {
  return `Avz-${Math.random().toString(36).slice(2, 8)}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
}

export async function createUser(
  formData: FormData
): Promise<ActionResult & { password?: string }> {
  if (!(await assertAdmin())) return { error: "Not authorised." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "student") as Role;
  const providedPassword = String(formData.get("password") ?? "").trim();
  const courseId = String(formData.get("course_id") ?? "").trim();

  if (!fullName || !email) {
    return { error: "Name and email are required." };
  }

  const password = providedPassword || randomPassword();
  const admin = createAdminClient();

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (error || !created.user) {
    return { error: error?.message ?? "Could not create the account." };
  }

  await admin.from("profiles").upsert({
    id: created.user.id,
    full_name: fullName,
    email,
    role,
  });

  if (role === "student" && courseId) {
    await admin.from("enrollments").upsert(
      { student_id: created.user.id, course_id: courseId, status: "active" },
      { onConflict: "student_id,course_id" }
    );
    await notify({
      recipientIds: [created.user.id],
      title: "Welcome to Avzdax Academy",
      body: "Your course is ready. Head to your dashboard to begin.",
      href: "/learn/course",
    });
  }

  if (role === "tutor" && courseId) {
    await admin.from("courses").update({ tutor_id: created.user.id }).eq("id", courseId);
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
  return { error: null, password };
}

export async function assignCourseTutor(
  courseId: string,
  tutorId: string
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Not authorised." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("courses")
    .update({ tutor_id: tutorId })
    .eq("id", courseId);
  if (error) return { error: "Could not assign the tutor." };
  revalidatePath("/admin/courses");
  return { error: null };
}

export async function updateRole(
  userId: string,
  role: Role
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Not authorised." };
  const admin = createAdminClient();
  await admin.from("profiles").update({ role }).eq("id", userId);
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
  revalidatePath("/admin/users");
  return { error: null };
}

export async function enrollStudent(
  userId: string,
  courseId: string
): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Not authorised." };
  const admin = createAdminClient();
  const { error } = await admin.from("enrollments").upsert(
    { student_id: userId, course_id: courseId, status: "active" },
    { onConflict: "student_id,course_id" }
  );
  if (error) return { error: "Could not enrol the student." };
  await notify({
    recipientIds: [userId],
    title: "You've been enrolled in a course",
    body: "Your new course is ready on your dashboard.",
    href: "/learn/course",
  });
  revalidatePath("/admin/users");
  return { error: null };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "Not authorised." };
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: "Could not remove the account." };
  revalidatePath("/admin/users");
  return { error: null };
}
