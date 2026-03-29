"use client";

import { useTranslations } from "next-intl";
import { OfficeTopology } from "@/components/ui/OfficeTopology";

const panelStyle = {
  background: "var(--151-glass-bg-medium)",
  backdropFilter: "blur(24px) saturate(150%)",
  WebkitBackdropFilter: "blur(24px) saturate(150%)",
  borderLeft: "1px solid var(--151-glass-border)",
  boxShadow:
    "-8px 0 40px rgba(0, 0, 0, 0.12), inset 1px 0 0 var(--151-glass-border)",
} as const;

export function ValueProp() {
  const t = useTranslations("home.standard");

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ scrollSnapAlign: "start" }}>
      {/* 3D Office topology — full viewport, camera offset shifts scene left */}
      <OfficeTopology />

      {/* ── Right panel: glass-backed text column (mirrors hero's left panel) ── */}
      <div className="absolute inset-y-0 right-0 z-10 w-full md:w-[38%] flex items-center">
        <div
          className="w-full h-full flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-14 py-24 md:py-0"
          style={panelStyle}
        >
          <div className="border-l-2 border-[var(--151-magenta-500)] pl-6 sm:pl-8">
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--151-text-primary)] tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-lg text-base md:text-lg leading-relaxed text-[var(--151-text-secondary)]">
              {t("body")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
