import { cn } from "@/lib/cn";

export function Wordmark({
  tone = "ink",
  size = "md",
  className,
}: {
  tone?: "ink" | "paper";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <img
        src="/avzdax-logo.png"
        alt="Avzdax"
        className={cn(
          "w-auto object-contain",
          size === "sm" ? "h-5" : "h-7",
          tone === "ink" && "[filter:brightness(0)]"
        )}
      />
      <span
        className={cn(
          "font-semibold uppercase",
          size === "sm"
            ? "pl-[0.24em] text-[0.5rem] tracking-[0.34em]"
            : "pl-[0.28em] text-[0.6rem] tracking-[0.42em]",
          tone === "paper" ? "text-white/60" : "text-muted"
        )}
      >
        Academy
      </span>
    </span>
  );
}
