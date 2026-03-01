"use client";

import { cn } from "@/lib/cn";

interface Logo151Props {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}

const sizeClasses = {
  sm: "text-xl font-bold",
  md: "text-2xl font-bold",
  lg: "text-4xl font-extrabold",
  hero: "text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter",
} as const;

export function Logo151({ size = "md", className }: Logo151Props) {
  return (
    <span
      className={cn(
        "font-[var(--font-display)] text-151-gradient select-none",
        sizeClasses[size],
        className
      )}
      aria-label="151"
    >
      151
    </span>
  );
}
