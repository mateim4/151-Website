"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/cn";

const phases = [
  { key: "think", number: "01", color: "magenta" },
  { key: "design", number: "02", color: "teal" },
  { key: "act", number: "03", color: "magenta" },
] as const;

export function TDATimeline() {
  const t = useTranslations("methodology.phases");

  return (
    <section className="py-16 sm:py-24 bg-[var(--151-bg-section-alt)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Timeline line */}
        <div className="relative">
          {/* Vertical gradient line */}
          <div
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-px"
            style={{ background: "var(--151-gradient-brand)" }}
          />

          <div className="space-y-16">
            {phases.map(({ key, number, color }, i) => (
              <RevealOnScroll key={key} delay={i * 0.15}>
                <div className="relative flex gap-6 sm:gap-8">
                  {/* Node */}
                  <div
                    className={cn(
                      "relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center",
                      "font-[var(--font-mono)] text-sm sm:text-base font-bold",
                      color === "magenta"
                        ? "bg-[var(--151-magenta-500)]/15 text-[var(--151-magenta-500)] border border-[var(--151-magenta-500)]/30"
                        : "bg-[var(--151-teal-500)]/15 text-[var(--151-teal-500)] border border-[var(--151-teal-500)]/30"
                    )}
                  >
                    {number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--151-text-primary)]">
                      {t(`${key}.title`)}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-sm font-medium uppercase tracking-wider",
                        color === "magenta"
                          ? "text-[var(--151-magenta-500)]"
                          : "text-[var(--151-teal-500)]"
                      )}
                    >
                      {t(`${key}.subtitle`)}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-[var(--151-text-secondary)]">
                      {t(`${key}.desc`)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {t(`${key}.deliverables`)
                        .split(", ")
                        .map((deliverable) => (
                          <span
                            key={deliverable}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              "bg-[var(--151-border-subtle)] text-[var(--151-text-secondary)]"
                            )}
                          >
                            {deliverable}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
