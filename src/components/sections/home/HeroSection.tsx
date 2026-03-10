"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Logo151 } from "@/components/ui/Logo151";
import { NetworkTopology } from "@/components/ui/NetworkTopology";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FloatingLogo } from "@/components/ui/FloatingLogo";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Network topology (desktop only, respects reduced motion) */}
      <NetworkTopology />

      {/* Floating logo — animates from hero center to navbar on scroll */}
      <FloatingLogo />

      {/* Content — frosted glass container, delayed reveal */}
      <motion.div
        className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8"
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.5, ease: [0.33, 0, 0.67, 1] }}
      >
        <div
          className="rounded-2xl px-8 py-10 sm:px-12 sm:py-14 text-center"
          style={{
            background: "var(--151-glass-bg-light)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            border: "1px solid var(--151-glass-border)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 var(--151-glass-border)",
          }}
        >
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.85, filter: "blur(24px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span id="hero-logo-slot" className="inline-flex">
              <Logo151 size="hero" />
            </span>
          </motion.div>

          <p className="mt-3 text-lg sm:text-xl md:text-2xl font-medium text-[var(--151-text-secondary)] tracking-wide uppercase">
            <TypeWriter
              text={t("tagline")}
              delay={3.6}
              speed={0.03}
              reduced={prefersReduced}
            />
          </p>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-[var(--151-text-muted)] leading-relaxed">
            <TypeWriter
              text={t("subtitle")}
              delay={3.8}
              speed={0.015}
              reduced={prefersReduced}
            />
          </p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 4.2 }}
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

        {/* Scroll indicator */}
        <motion.div
          className="mt-8"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.6 }}
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
              className="mx-auto text-[var(--151-text-secondary)]"
              aria-hidden="true"
            >
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
