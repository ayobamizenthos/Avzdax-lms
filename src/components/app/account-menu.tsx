"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/app/(app)/actions";

export function AccountMenu({
  name,
  email,
  roleLabel,
  avatarUrl,
}: {
  name: string;
  email: string;
  roleLabel: string;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-sm border border-line bg-surface px-2.5 py-2 text-left transition-colors hover:border-line-strong"
      >
        <Avatar name={name} src={avatarUrl} size={36} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {name}
          </span>
          <span className="block truncate text-xs text-muted">{roleLabel}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted" />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-md border border-line bg-surface shadow-float">
          <div className="border-b border-line px-3.5 py-3">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            <UserRound className="size-4" />
            Profile
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-danger-tint hover:text-danger"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
