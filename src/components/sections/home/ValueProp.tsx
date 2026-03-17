"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { OfficeTopology } from "@/components/ui/OfficeTopology";

export function ValueProp() {
  const t = useTranslations("home.standard");

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* 3D Office topology (desktop only, respects reduced motion) */}
      <OfficeTopology />

      <GradientOrb
        color="magenta"
        size="300px"
        className="top-0 right-[-5%] opacity-20"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="border-l-2 border-[var(--151-magenta-500)] pl-6 sm:pl-8">
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--151-text-primary)] tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--151-text-secondary)]">
              {t("body")}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
