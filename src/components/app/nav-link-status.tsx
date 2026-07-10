"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

export function NavLinkStatus() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 className="ml-auto size-4 animate-spin text-current" />;
}
