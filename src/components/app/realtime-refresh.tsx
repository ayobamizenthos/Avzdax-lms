"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const tables = [
  "submissions",
  "assignments",
  "lessons",
  "modules",
  "resources",
  "quizzes",
  "quiz_attempts",
  "class_sessions",
  "enrollments",
  "lesson_progress",
  "certificates",
  "courses",
  "payments",
];

export function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("platform-sync");

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          clearTimeout(timer.current);
          timer.current = setTimeout(() => router.refresh(), 350);
        }
      );
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel.subscribe();
    });

    return () => {
      clearTimeout(timer.current);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
