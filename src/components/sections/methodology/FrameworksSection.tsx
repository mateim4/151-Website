"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/cn";

const frameworks = [
  { key: "togaf", label: "TOGAF" },
  { key: "itil", label: "ITIL" },
  { key: "dora", label: "DORA" },
] as const;

export function FrameworksSection() {
  const t = useTranslations("methodology.frameworks");

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--151-text-primary)] tracking-tight">
            {t("title")}
          </h2>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {frameworks.map(({ key, label }, i) => (
            <RevealOnScroll key={key} delay={i * 0.1}>
              <div
                className={cn(
                  "p-6 rounded-2xl h-full",
                  "bg-[var(--151-bg-card)] border border-[var(--151-border-subtle)]"
                )}
              >
                <span className="text-sm font-bold font-[var(--font-mono)] text-[var(--151-magenta-500)] uppercase tracking-wider">
                  {label}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-[var(--151-text-secondary)]">
                  {t(key)}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
