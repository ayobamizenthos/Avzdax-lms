import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Role = Database["public"]["Enums"]["user_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(...allowed: Role[]): Promise<Profile> {
  const profile = await requireProfile();
  if (!allowed.includes(profile.role)) redirect(landingFor(profile.role));
  return profile;
}

export function landingFor(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "tutor") return "/tutor";
  return "/learn";
}
