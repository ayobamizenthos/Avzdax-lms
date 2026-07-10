import { forwardRef } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-[background,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-ink shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_6px_18px_-8px_rgba(17,19,24,0.55)] hover:bg-brand-deep",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink/30 hover:bg-white",
  ghost: "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
  danger: "bg-danger text-white hover:brightness-95",
  gold: "bg-gold text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

type LinkButtonProps = CommonProps &
  React.ComponentProps<typeof Link>;

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
