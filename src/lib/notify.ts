import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

type NotifyInput = {
  recipientIds: string[];
  title: string;
  body?: string;
  href?: string;
};

export async function notify({ recipientIds, title, body, href }: NotifyInput) {
  if (recipientIds.length === 0) return;
  const admin = createAdminClient();
  await admin.from("notifications").insert(
    recipientIds.map((recipientId) => ({
      recipient_id: recipientId,
      title,
      body: body ?? null,
      href: href ?? null,
    }))
  );

  const { data: recipients } = await admin
    .from("profiles")
    .select("email")
    .in("id", recipientIds);

  await sendEmail({
    to: (recipients ?? []).map((recipient) => recipient.email),
    subject: title,
    heading: title,
    message: body ?? "",
    href,
  });
}

export async function studentsInCourse(courseId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("enrollments")
    .select("student_id")
    .eq("course_id", courseId)
    .eq("status", "active");
  return (data ?? []).map((row) => row.student_id);
}

export async function adminIds() {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((row) => row.id);
}
