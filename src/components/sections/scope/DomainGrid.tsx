"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const domains = [
  { key: "compute", color: "magenta" },
  { key: "network", color: "teal" },
  { key: "storage", color: "magenta" },
  { key: "cloud", color: "teal" },
  { key: "security", color: "magenta" },
  { key: "automation", color: "teal" },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 0, 0.67, 1] as const },
  },
};

export function DomainGrid() {
  const t = useTranslations("scope.domains");

  return (
    <section className="py-16 sm:py-24 bg-[var(--151-bg-section-alt)]">
      <motion.div
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {domains.map(({ key, color }) => (
          <motion.div
            key={key}
            variants={itemVariants}
            className={cn(
              "group p-6 rounded-2xl cursor-default",
              "bg-[var(--151-bg-card)] border border-[var(--151-border-subtle)]",
              "hover:border-[var(--151-magenta-500)]/25 transition-all duration-300",
              color === "magenta"
                ? "hover:shadow-[0_0_25px_var(--151-glow-magenta)]"
                : "hover:shadow-[0_0_25px_var(--151-glow-teal)]"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
                color === "magenta"
                  ? "bg-[var(--151-magenta-500)]/10 text-[var(--151-magenta-500)]"
                  : "bg-[var(--151-teal-500)]/10 text-[var(--151-teal-500)]"
              )}
            >
              {key.charAt(0).toUpperCase()}
            </div>

            <h3 className="mt-4 font-[var(--font-display)] text-lg font-semibold text-[var(--151-text-primary)]">
              {t(`${key}.title`)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--151-text-secondary)]">
              {t(`${key}.desc`)}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
