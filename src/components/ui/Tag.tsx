import { cn } from "@/lib/cn";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-medium",
        "bg-[var(--151-magenta-500)]/10 text-[var(--151-magenta-500)]",
        className
      )}
    >
      {children}
    </span>
  );
}
