"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { GradientOrb } from "@/components/ui/GradientOrb";

export function CTASection() {
  const t = useTranslations("home.cta");

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <GradientOrb
        color="magenta"
        size="400px"
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll>
          <div className="glass-151 p-12 sm:p-16">
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--151-text-primary)] tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-[var(--151-text-secondary)]">
              {t("subtitle")}
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-[var(--151-magenta-500)] hover:bg-[var(--151-magenta-400)] transition-all duration-200 shadow-[0_0_20px_var(--151-glow-magenta)] hover:shadow-[0_0_30px_var(--151-glow-magenta)] hover:-translate-y-0.5"
            >
              {t("button")}
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
