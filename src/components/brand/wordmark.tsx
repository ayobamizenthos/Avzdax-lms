import { cn } from "@/lib/cn";

export function Wordmark({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "paper";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-md",
          tone === "paper" ? "bg-white/10" : "bg-brand"
        )}
      >
        <img
          src="/avzdax-logoX.png"
          alt="Avzdax"
          className="size-6 object-contain"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.05rem] font-semibold tracking-tight",
            tone === "paper" ? "text-white" : "text-ink"
          )}
        >
          Avzdax
        </span>
        <span
          className={cn(
            "text-[0.62rem] font-medium uppercase tracking-[0.22em]",
            tone === "paper" ? "text-white/55" : "text-muted"
          )}
        >
          Academy
        </span>
      </span>
    </span>
  );
}
