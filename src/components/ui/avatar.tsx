import { cn } from "@/lib/cn";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const palette = [
  "bg-[#111318] text-white",
  "bg-[#2b2f36] text-white",
  "bg-[#3d4149] text-white",
  "bg-[#1a1c22] text-white",
  "bg-[#4a4f5a] text-white",
];

function hue(name: string) {
  let sum = 0;
  for (const char of name) sum += char.charCodeAt(0);
  return palette[sum % palette.length];
}

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full font-semibold",
        hue(name),
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
