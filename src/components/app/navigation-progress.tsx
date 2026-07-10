"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [trackedPath, setTrackedPath] = useState(pathname);

  if (pathname !== trackedPath) {
    setTrackedPath(pathname);
    setActive(false);
  }

  useEffect(() => {
    function shouldTrack(anchor: HTMLAnchorElement) {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return false;
      if (anchor.hasAttribute("download")) return false;
      try {
        const url = new URL(anchor.href);
        return url.origin === location.origin && url.pathname !== location.pathname;
      } catch {
        return false;
      }
    }

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (anchor && shouldTrack(anchor as HTMLAnchorElement)) {
        setActive(true);
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
      <div className="nav-progress-bar h-full rounded-r-full bg-ink shadow-[0_0_10px_rgba(10,11,13,0.4)]" />
    </div>
  );
}
