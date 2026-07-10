"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { navFor } from "@/lib/navigation";
import { NavLinkStatus } from "@/components/app/nav-link-status";
import type { Role } from "@/lib/session";

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navFor(role);

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === pathname ||
          (item.href !== "/learn" &&
            item.href !== "/tutor" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-tint text-brand-deep"
                : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"
            )}
          >
            <item.icon
              className={cn(
                "size-[1.15rem] transition-colors",
                active ? "text-brand" : "text-muted group-hover:text-ink-soft"
              )}
              strokeWidth={1.9}
            />
            {item.label}
            <NavLinkStatus />
          </Link>
        );
      })}
    </nav>
  );
}
