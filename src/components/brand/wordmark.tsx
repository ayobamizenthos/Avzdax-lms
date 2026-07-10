import { cn } from "@/lib/cn";

export function Wordmark({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "paper";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <img
        src="/avzdax-logo.png"
        alt="Avzdax"
        className={cn(
          "h-7 w-auto object-contain",
          tone === "ink" && "[filter:brightness(0)]"
        )}
      />
      <span
        className={cn(
          "pl-[0.28em] text-[0.6rem] font-semibold uppercase tracking-[0.42em]",
          tone === "paper" ? "text-white/60" : "text-muted"
        )}
      >
        Academy
      </span>
    </span>
  );
}
