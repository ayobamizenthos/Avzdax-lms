"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error: string | null; ok: boolean };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in again.", ok: false };

  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ phone: phone || null })
    .eq("id", user.id);

  if (error) return { error: "Could not save your changes.", ok: false };

  revalidatePath("/profile");
  return { error: null, ok: true };
}
