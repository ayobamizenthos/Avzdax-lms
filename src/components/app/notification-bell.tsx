"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { playChime, primeAudio } from "@/lib/notification-sound";
import type { Database } from "@/lib/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function NotificationBell({
  recipientId,
  initial,
}: {
  recipientId: string;
  initial: Notification[];
}) {
  const [items, setItems] = useState<Notification[]>(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((item) => !item.read_at).length;

  useEffect(() => {
    const prime = () => primeAudio();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload) => {
          const incoming = payload.new as Notification;
          setItems((prev) => [incoming, ...prev].slice(0, 30));
          playChime();
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(incoming.title, {
              body: incoming.body ?? undefined,
              icon: "/avzdax-mark.png",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
        }
      );

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel.subscribe();
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [recipientId]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = items.filter((item) => !item.read_at).map((item) => item.id);
    if (unreadIds.length === 0) return;
    const stamp = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => (item.read_at ? item : { ...item, read_at: stamp }))
    );
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: stamp })
      .in("id", unreadIds);
  }, [items]);

  const markOneRead = useCallback(async (id: string) => {
    const stamp = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && !item.read_at ? { ...item, read_at: stamp } : item
      )
    );
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: stamp })
      .eq("id", id)
      .is("read_at", null);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (typeof Notification !== "undefined" && Notification.permission === "default") {
            void Notification.requestPermission();
          }
        }}
        className="relative grid size-10 place-items-center rounded-sm border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="size-[1.15rem]" strokeWidth={1.9} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-semibold text-brand-ink">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-line bg-surface shadow-float">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                <Check className="size-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">
                You&rsquo;re all caught up.
              </p>
            ) : (
              items.map((item) => {
                const body = (
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-paper",
                      !item.read_at && "bg-brand-tint/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        item.read_at ? "bg-transparent" : "bg-brand"
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {item.title}
                      </span>
                      {item.body ? (
                        <span className="mt-0.5 block text-sm text-ink-soft">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-xs text-muted">
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                  </div>
                );

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      void markOneRead(item.id);
                      setOpen(false);
                    }}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void markOneRead(item.id)}
                    className="block w-full text-left"
                  >
                    {body}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
