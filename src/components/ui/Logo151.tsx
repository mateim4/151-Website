"use client";

import { cn } from "@/lib/cn";

interface Logo151Props {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}

const sizeClasses = {
  sm: "h-12",
  md: "h-10",
  lg: "h-14",
  hero: "h-20 sm:h-28 md:h-36 lg:h-48",
} as const;

export function Logo151({ size = "md", className }: Logo151Props) {
  return (
    <img
      src="/logo/151-text.svg"
      alt="151"
      className={cn("block mx-auto w-auto select-none", sizeClasses[size], className)}
      draggable={false}
    />
  );
}
