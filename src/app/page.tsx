import { redirect } from "next/navigation";

import { getSessionProfile, landingFor } from "@/lib/session";

export default async function RootRoute() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  redirect(landingFor(profile.role));
}
