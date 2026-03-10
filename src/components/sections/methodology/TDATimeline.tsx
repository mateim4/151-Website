"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/cn";

const phases = [
  { key: "think", number: "01" },
  { key: "design", number: "02" },
  { key: "act", number: "03" },
] as const;

interface Segment {
  top: number;
  height: number;
}

export function TDATimeline() {
  const t = useTranslations("methodology.phases");
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activePhase, setActivePhase] = useState(-1);

  // Measure gap segments between consecutive nodes
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const segs: Segment[] = [];
    for (let i = 0; i < phases.length - 1; i++) {
      const curr = nodeRefs.current[i];
      const next = nodeRefs.current[i + 1];
      if (!curr || !next) continue;

      const currRect = curr.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();

      const segTop = currRect.bottom - cRect.top;
      const segEnd = nextRect.top - cRect.top;
      segs.push({ top: segTop, height: segEnd - segTop });
    }
    setSegments(segs);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.7", "end 0.5"],
  });

  // Each segment grows during its portion of the scroll
  const seg0ScaleY = useTransform(scrollYProgress, [0.0, 0.45], [0, 1]);
  const seg1ScaleY = useTransform(scrollYProgress, [0.45, 0.85], [0, 1]);
  const segScales = [seg0ScaleY, seg1ScaleY];

  // Activate phases as scroll progresses
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.75) setActivePhase(2);
    else if (v > 0.35) setActivePhase(1);
    else if (v > 0.05) setActivePhase(0);
    else setActivePhase(-1);
  });

  return (
    <section className="py-16 sm:py-24 bg-[var(--151-bg-section-alt)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative" ref={containerRef}>
          {/* Connector segments — one per gap between nodes */}
          {segments.map((seg, i) => (
            <div key={i}>
              {/* Background track */}
              <div
                className="absolute left-6 sm:left-8 w-px -translate-x-1/2 bg-[var(--151-border-subtle)]"
                style={{ top: seg.top, height: seg.height }}
              />
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute left-6 sm:left-8 w-px -translate-x-1/2 origin-top"
                style={{
                  top: seg.top,
                  height: seg.height,
                  scaleY: segScales[i],
                  background: "var(--151-gradient-brand)",
                }}
              />
            </div>
          ))}

          <div className="space-y-16">
            {phases.map(({ key, number }, i) => {
              const isActive = activePhase >= i;

              return (
                <div key={key} className="relative flex gap-6 sm:gap-8">
                  {/* Node */}
                  <div
                    ref={(el) => { nodeRefs.current[i] = el; }}
                    className={cn(
                      "relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl",
                      "flex items-center justify-center",
                      "font-[var(--font-mono)] text-sm sm:text-base font-bold",
                      "border transition-all duration-500",
                      isActive
                        ? "bg-[var(--151-violet-500)]/20 text-[var(--151-violet-500)] border-[var(--151-violet-500)]/50 shadow-[0_0_20px_var(--151-glow-magenta)]"
                        : "bg-[var(--151-bg-card)] text-[var(--151-text-muted)] border-[var(--151-border-subtle)]"
                    )}
                  >
                    {number}
                  </div>

                  {/* Content */}
                  <div
                    className={cn(
                      "flex-1 pb-4 transition-opacity duration-500",
                      isActive ? "opacity-100" : "opacity-40"
                    )}
                  >
                    <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--151-text-primary)]">
                      {t(`${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm font-medium uppercase tracking-wider text-[var(--151-magenta-500)]">
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
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--151-border-subtle)] text-[var(--151-text-secondary)]"
                          >
                            {deliverable}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
