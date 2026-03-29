"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Logo151 } from "@/components/ui/Logo151";
import { NetworkTopology } from "@/components/ui/NetworkTopology";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FloatingLogo } from "@/components/ui/FloatingLogo";

const panelStyle = {
  background: "var(--151-glass-bg-medium)",
  backdropFilter: "blur(24px) saturate(150%)",
  WebkitBackdropFilter: "blur(24px) saturate(150%)",
  borderRight: "1px solid var(--151-glass-border)",
  boxShadow:
    "8px 0 40px rgba(0, 0, 0, 0.12), inset -1px 0 0 var(--151-glass-border)",
} as const;

/** Fast typewriter: reveals characters one-by-one with staggered opacity. */
function TypeWriter({
  text,
  delay,
  speed = 0.025,
  reduced,
}: {
  text: string;
  delay: number;
  speed?: number;
  reduced: boolean;
}) {
  if (reduced) return <>{text}</>;

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { delayChildren: delay, staggerChildren: speed },
        },
      }}
      aria-label={text}
    >
      {Array.from(text).map((char, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          aria-hidden
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function HeroSection() {
  const t = useTranslations("home.hero");
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative min-h-screen overflow-hidden scroll-snap-align-start" style={{ scrollSnapAlign: "start" }}>
      {/* 3D Network topology — full viewport, camera offset shifts corridor right */}
      <NetworkTopology />

      {/* Floating logo — animates from hero to navbar on scroll */}
      <FloatingLogo />

      {/* ── Left panel: glass-backed text column ── */}
      <motion.div
        className="absolute inset-y-0 left-0 z-10 w-full md:w-[38%] flex items-center"
        initial={prefersReduced ? false : { opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Desktop: full-height glass panel flush with left edge */}
        {/* Mobile: overlay with glass background */}
        <div
          className="w-full h-full flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-14 py-20 md:py-0"
          style={panelStyle}
        >
          {/* Logo */}
          <motion.div
            initial={
              prefersReduced
                ? false
                : { opacity: 0, scale: 0.85, filter: "blur(24px)" }
            }
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 2.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span id="hero-logo-slot" className="inline-flex">
              <Logo151 size="hero" className="!h-16 sm:!h-20 md:!h-24 lg:!h-28" />
            </span>
          </motion.div>

          {/* Tagline */}
          <p className="mt-4 text-sm sm:text-base md:text-lg font-medium text-[var(--151-text-secondary)] tracking-wide uppercase">
            <TypeWriter
              text={t("tagline")}
              delay={3.2}
              speed={0.03}
              reduced={prefersReduced}
            />
          </p>

          {/* Subtitle */}
          <p className="mt-5 text-sm md:text-base text-[var(--151-text-muted)] leading-relaxed max-w-md">
            <TypeWriter
              text={t("subtitle")}
              delay={3.6}
              speed={0.015}
              reduced={prefersReduced}
            />
          </p>

          {/* CTAs */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 4.0 }}
          >
            <MagneticButton>
              <Link href="/methodology" className="btn-glass-primary">
                <span className="relative drop-shadow-sm">{t("cta")}</span>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/scope" className="btn-glass-secondary">
                <span className="relative">{t("ctaSecondary")}</span>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator — centered at bottom of full viewport */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.4 }}
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
            className="text-[var(--151-text-secondary)]"
            aria-hidden="true"
          >
            <polyline points="7 13 12 18 17 13" />
            <polyline points="7 6 12 11 17 6" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
