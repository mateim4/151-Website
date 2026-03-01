"use client";

import { cn } from "@/lib/cn";

interface GradientOrbProps {
  color: "magenta" | "teal";
  size?: string;
  className?: string;
}

export function GradientOrb({
  color,
  size = "400px",
  className,
}: GradientOrbProps) {
  return (
    <div
      className={cn("gradient-orb", color, className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
