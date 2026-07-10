"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

import { cn } from "@/lib/cn";
import { NavLinkStatus } from "@/components/app/nav-link-status";
import { Wordmark } from "@/components/brand/wordmark";
import { signOut } from "@/app/(app)/actions";
import { navFor } from "@/lib/navigation";
import type { Role } from "@/lib/session";

export function MobileNav({
  role,
  name,
  roleLabel,
}: {
  role: Role;
  name: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navFor(role);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-sm border border-line bg-surface text-ink-soft"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface px-4 py-6 shadow-float">
            <div className="flex items-center justify-between px-2">
              <Wordmark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-sm text-muted hover:text-ink"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-8 flex-1 space-y-1">
              {items.map((item) => {
                const active =
                  item.href === pathname ||
                  (!["/learn", "/tutor", "/admin"].includes(item.href) &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-brand-tint text-brand-deep"
                        : "text-ink-soft hover:bg-ink/[0.04]"
                    )}
                  >
                    <item.icon className="size-[1.15rem]" strokeWidth={1.9} />
                    {item.label}
                    <NavLinkStatus />
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-line pt-4">
              <p className="px-3 text-sm font-medium text-ink">{name}</p>
              <p className="px-3 text-xs text-muted">{roleLabel}</p>
              <form action={signOut} className="mt-3">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-ink-soft hover:bg-danger-tint hover:text-danger"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
