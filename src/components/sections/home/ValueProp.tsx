"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/cn";

export function ValueProp() {
  const t = useTranslations("home.standard");

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--151-text-primary)] tracking-tight">
            {t("title")}
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--151-text-secondary)]">
            {t("body")}
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
