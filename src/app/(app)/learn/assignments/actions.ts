"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notify, courseTutorIds } from "@/lib/notify";
import type { Database } from "@/lib/database.types";

type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"];

export type SubmitState = { error: string | null; ok: boolean };

export async function submitAssignment(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in again.", ok: false };

  const assignmentId = String(formData.get("assignment_id") ?? "");
  if (!assignmentId) return { error: "Missing assignment.", ok: false };

  const body = String(formData.get("body") ?? "").trim();

  const links = formData
    .getAll("link_url")
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);
  for (const link of links) {
    if (!/^https?:\/\//i.test(link)) {
      return { error: `"${link}" is not a valid link. Links must start with http.`, ok: false };
    }
  }

  const files = formData
    .getAll("file")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!body && files.length === 0 && links.length === 0) {
    return {
      error: "Add a written response, a file or a link before submitting.",
      ok: false,
    };
  }

  const uploaded: { path: string; name: string }[] = [];
  for (const file of files) {
    const path = `${user.id}/${assignmentId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      return { error: `Upload failed for ${file.name}. Try a smaller file.`, ok: false };
    }
    uploaded.push({ path, name: file.name });
  }

  const kind: "text" | "file" | "link" = body
    ? "text"
    : uploaded.length > 0
      ? "file"
      : "link";

  const payload: SubmissionInsert = {
    assignment_id: assignmentId,
    student_id: user.id,
    kind,
    body: body || null,
    file_url: uploaded[0]?.path ?? null,
    file_paths: uploaded,
    link_url: links[0] ?? null,
    link_urls: links,
    status: "pending",
    score: null,
    feedback: null,
    submitted_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("submissions")
    .upsert(payload, { onConflict: "assignment_id,student_id" });

  if (error) return { error: "Could not save your submission.", ok: false };

  const [{ data: profile }, { data: assignment }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("assignments")
      .select("title, modules(courses(id))")
      .eq("id", assignmentId)
      .single(),
  ]);

  const courseId = assignment?.modules?.courses?.id;

  if (courseId) {
    await notify({
      recipientIds: await courseTutorIds(courseId),
      title: "New submission received",
      body: `${profile?.full_name ?? "A student"} submitted "${assignment?.title ?? "an assignment"}"`,
      href: "/tutor/submissions",
    });
  }

  revalidatePath("/learn/assignments");
  return { error: null, ok: true };
}
