"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/cn";

interface CaseStudy {
  key: string;
  techStack: string[];
}

const caseStudies: CaseStudy[] = [
  {
    key: "datacenter",
    techStack: ["VMware vSAN", "Terraform", "Ansible", "Azure Arc", "SD-WAN"],
  },
  {
    key: "zerotrust",
    techStack: ["Palo Alto Prisma", "CrowdStrike", "Splunk SIEM", "SOAR"],
  },
  {
    key: "mlops",
    techStack: ["NVIDIA DGX", "Kubernetes", "MLflow", "Triton", "InfiniBand"],
  },
];

export function CaseStudyCards() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {caseStudies.map((study, i) => (
          <RevealOnScroll key={study.key} delay={i * 0.1}>
            <CaseCard study={study} />
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}

function CaseCard({ study }: { study: CaseStudy }) {
  const t = useTranslations("portfolio");
  const [expanded, setExpanded] = useState(false);

  const accentText = "text-[var(--151-magenta-500)]";
  const accentBg = "bg-[var(--151-magenta-500)]/10";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--151-border-subtle)] overflow-hidden",
        "bg-[var(--151-bg-elevated)] transition-[border-color,box-shadow,transform] duration-300",
        "hover:border-[var(--151-border-medium)]"
      )}
    >
      {/* Header */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3",
                accentBg,
                accentText
              )}
            >
              {t(`cases.${study.key}.industry`)}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--151-text-primary)] font-[var(--font-display)]">
              {t(`cases.${study.key}.title`)}
            </h3>
          </div>
          {/* Metrics */}
          <div className="flex gap-4 sm:gap-6">
            {Object.entries(
              t.raw(`cases.${study.key}.metrics`) as Record<string, string>
            ).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className={cn("text-lg sm:text-xl font-bold", accentText)}>
                  {v}
                </div>
                <div className="text-xs text-[var(--151-text-muted)] uppercase tracking-wider">
                  {k}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "mt-4 flex items-center gap-2 text-sm font-medium transition-colors",
            accentText
          )}
          aria-expanded={expanded}
        >
          {expanded ? t("collapse") : t("challenge")}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn("transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 pb-8 space-y-6">
              <div className={cn("border-t pt-6", "border-[var(--151-border-subtle)]")}>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Challenge */}
                  <div>
                    <h4 className={cn("text-sm font-semibold uppercase tracking-wider mb-2", accentText)}>
                      {t("challenge")}
                    </h4>
                    <p className="text-sm leading-relaxed text-[var(--151-text-secondary)]">
                      {t(`cases.${study.key}.challenge`)}
                    </p>
                  </div>
                  {/* Architecture */}
                  <div>
                    <h4 className={cn("text-sm font-semibold uppercase tracking-wider mb-2", accentText)}>
                      {t("architecture")}
                    </h4>
                    <p className="text-sm leading-relaxed text-[var(--151-text-secondary)]">
                      {t(`cases.${study.key}.architecture`)}
                    </p>
                  </div>
                  {/* Result */}
                  <div>
                    <h4 className={cn("text-sm font-semibold uppercase tracking-wider mb-2", accentText)}>
                      {t("result")}
                    </h4>
                    <p className="text-sm leading-relaxed text-[var(--151-text-secondary)]">
                      {t(`cases.${study.key}.result`)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tech stack */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--151-text-muted)] mb-2">
                  {t("techStack")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {study.techStack.map((tech) => (
                    <span
                      key={tech}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium",
                        "bg-[var(--151-border-subtle)] text-[var(--151-text-secondary)]"
                      )}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
