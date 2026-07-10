import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";
import { roleLabel } from "@/lib/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { AccountMenu } from "@/components/app/account-menu";
import { NotificationBell } from "@/components/app/notification-bell";
import { MobileNav } from "@/components/app/mobile-nav";
import { RealtimeRefresh } from "@/components/app/realtime-refresh";
import { NavigationProgress } from "@/components/app/navigation-progress";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="flex min-h-dvh bg-paper">
      <RealtimeRefresh />
      <NavigationProgress />
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <div className="px-2">
          <Wordmark />
        </div>
        <div className="mt-8 flex-1">
          <SidebarNav role={profile.role} />
        </div>
        <AccountMenu
          name={profile.full_name}
          email={profile.email}
          roleLabel={roleLabel[profile.role]}
          avatarUrl={profile.avatar_url}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 bg-paper/85 px-5 backdrop-blur-md sm:px-8">
          <MobileNav
            role={profile.role}
            name={profile.full_name}
            roleLabel={roleLabel[profile.role]}
          />
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell
              recipientId={profile.id}
              initial={notifications ?? []}
            />
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
