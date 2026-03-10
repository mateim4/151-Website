"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  decoration?: "none" | "orb" | "grid-dots" | "gradient-line";
}

export function PageHeader({
  title,
  subtitle,
  align = "left",
  decoration = "none",
}: PageHeaderProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.8], [0.4, 0]);

  return (
    <div className="pt-24">
      <section ref={sectionRef} className="relative py-16 sm:py-24 overflow-hidden">
        {/* Decorative elements */}
        {decoration === "orb" && (
          <motion.div
            className="absolute top-[-20%] right-[-10%]"
            style={{ y: orbY, opacity: orbOpacity }}
          >
            <GradientOrb
              color="magenta"
              size="400px"
            />
          </motion.div>
        )}

        {decoration === "grid-dots" && (
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--151-text-primary) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />
        )}

        {decoration === "gradient-line" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-0.5">
            <div
              className="h-full rounded-full animate-pulse"
              style={{ background: "var(--151-gradient-brand)" }}
            />
          </div>
        )}

        <div
          className={cn(
            "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8",
            align === "center" && "text-center"
          )}
        >
          <RevealOnScroll>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold text-[var(--151-text-primary)] tracking-tight">
              {title}
            </h1>
          </RevealOnScroll>

          {subtitle && (
            <RevealOnScroll delay={0.1} direction="none">
              <p
                className={cn(
                  "mt-6 text-lg leading-relaxed text-[var(--151-text-secondary)]",
                  align === "center" ? "max-w-2xl mx-auto" : "max-w-3xl"
                )}
              >
                {subtitle}
              </p>
            </RevealOnScroll>
          )}
        </div>
      </section>
    </div>
  );
}
