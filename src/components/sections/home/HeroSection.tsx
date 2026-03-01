"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Logo151 } from "@/components/ui/Logo151";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function HeroSection() {
  const t = useTranslations("home.hero");
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background orbs */}
      <GradientOrb
        color="magenta"
        size="600px"
        className="top-[-10%] right-[-10%] opacity-60"
      />
      <GradientOrb
        color="teal"
        size="500px"
        className="bottom-[-15%] left-[-10%] opacity-40"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.33, 0, 0.67, 1] }}
        >
          <Logo151 size="hero" />
        </motion.div>

        <motion.p
          className="mt-6 text-lg sm:text-xl md:text-2xl font-medium text-[var(--151-text-secondary)] tracking-wide uppercase"
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {t("tagline")}
        </motion.p>

        <motion.p
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-[var(--151-text-muted)] leading-relaxed"
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link
            href="/methodology"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-[var(--151-magenta-500)] hover:bg-[var(--151-magenta-400)] transition-all duration-200 shadow-[0_0_20px_var(--151-glow-magenta)] hover:shadow-[0_0_30px_var(--151-glow-magenta)] hover:-translate-y-0.5"
          >
            {t("cta")}
          </Link>
          <Link
            href="/scope"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-semibold text-[var(--151-text-primary)] border border-[var(--151-border-medium)] hover:border-[var(--151-magenta-500)] hover:text-[var(--151-magenta-500)] transition-all duration-200"
          >
            {t("ctaSecondary")}
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={prefersReduced ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[var(--151-text-muted)]"
              aria-hidden="true"
            >
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
