import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "gold" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/[0.06] text-ink-soft",
  brand: "bg-brand-tint text-brand-deep",
  gold: "bg-gold-tint text-gold",
  danger: "bg-danger-tint text-danger",
  info: "bg-[#eef0f2] text-info",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: { tone?: Tone } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
