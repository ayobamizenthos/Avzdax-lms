"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { landingFor } from "@/lib/session";

export type LoginState = { error: string | null };

export async function signIn(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Those credentials don't match an account. Try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", email)
    .single();

  redirect(next || landingFor(profile?.role ?? "student"));
}
