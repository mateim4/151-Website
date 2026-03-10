"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Pillar = "ict" | "incident" | "resilience" | "thirdparty" | "sharing";

interface Question {
  id: string;
  pillar: Pillar;
}

const questions: Question[] = [
  { id: "ict1", pillar: "ict" },
  { id: "ict2", pillar: "ict" },
  { id: "incident1", pillar: "incident" },
  { id: "incident2", pillar: "incident" },
  { id: "resilience1", pillar: "resilience" },
  { id: "resilience2", pillar: "resilience" },
  { id: "thirdparty1", pillar: "thirdparty" },
  { id: "thirdparty2", pillar: "thirdparty" },
  { id: "sharing1", pillar: "sharing" },
  { id: "sharing2", pillar: "sharing" },
];

const answerValues = { a: 0, b: 1, c: 2, d: 3 } as const;
type AnswerKey = keyof typeof answerValues;

function getLevel(score: number): string {
  if (score < 1) return "critical";
  if (score < 2) return "developing";
  if (score < 2.5) return "established";
  return "advanced";
}

const levelColors: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10",
  developing: "text-amber-400 bg-amber-500/10",
  established: "text-[var(--151-violet-500)] bg-[var(--151-violet-500)]/10",
  advanced: "text-emerald-400 bg-emerald-500/10",
};

const pillarOrder: Pillar[] = ["ict", "incident", "resilience", "thirdparty", "sharing"];

export function DoraAssessment() {
  const t = useTranslations("diagnostic");
  const [stage, setStage] = useState<"intro" | "questions" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});

  function selectAnswer(answer: AnswerKey) {
    const newAnswers = { ...answers, [questions[currentQ].id]: answer };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  }

  function getPillarScore(pillar: Pillar): number {
    const pillarQs = questions.filter((q) => q.pillar === pillar);
    const scores = pillarQs
      .map((q) => answers[q.id])
      .filter(Boolean)
      .map((a) => answerValues[a] as number);
    if (scores.length === 0) return 0;
    return scores.reduce((s, v) => s + v, 0) / scores.length;
  }

  function getOverallScore(): number {
    const pillarScores = pillarOrder.map(getPillarScore);
    return pillarScores.reduce((s, v) => s + v, 0) / pillarScores.length;
  }

  const allAnswered = Object.keys(answers).length === questions.length;

  // ── Intro ──────────────────────────────────────────────────────────
  if (stage === "intro") {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--151-magenta-500)]/10 mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--151-magenta-500)" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <p className="max-w-xl mx-auto text-[var(--151-text-secondary)] leading-relaxed mb-8">
          {t("subtitle")}
        </p>
        <button onClick={() => setStage("questions")} className="btn-glass-primary">
          {t("start")}
        </button>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────
  if (stage === "results") {
    const overall = getOverallScore();
    const overallLevel = getLevel(overall);
    const percentage = Math.round((overall / 3) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8"
      >
        <h2 className="text-2xl font-bold text-[var(--151-text-primary)] font-[var(--font-display)] mb-8 text-center">
          {t("results.title")}
        </h2>

        {/* Overall score ring */}
        <div className="flex justify-center mb-12">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--151-border-subtle)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--151-magenta-500)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.64} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--151-text-primary)]">{percentage}%</span>
              <span className={cn("text-xs font-semibold uppercase px-2 py-0.5 rounded-full mt-1", levelColors[overallLevel])}>
                {t(`levels.${overallLevel}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar breakdown */}
        <h3 className="text-lg font-semibold text-[var(--151-text-primary)] mb-4">
          {t("results.breakdown")}
        </h3>
        <div className="space-y-4 mb-10">
          {pillarOrder.map((pillar) => {
            const score = getPillarScore(pillar);
            const level = getLevel(score);
            const pct = Math.round((score / 3) * 100);
            return (
              <div key={pillar}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-[var(--151-text-secondary)]">
                    {t(`pillars.${pillar}`)}
                  </span>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", levelColors[level])}>
                    {t(`levels.${level}`)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[var(--151-border-subtle)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--151-magenta-600)] to-[var(--151-magenta-400)]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/about" className="btn-glass-primary">
            {t("contactCta")}
          </Link>
          <button
            onClick={() => {
              setAnswers({});
              setCurrentQ(0);
              setStage("intro");
            }}
            className="btn-glass-secondary"
          >
            {t("restart")}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Questions ──────────────────────────────────────────────────────
  const q = questions[currentQ];
  const currentAnswer = answers[q.id];

  return (
    <div className="py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[var(--151-text-muted)]">
            {t("progress", { current: currentQ + 1, total: questions.length })}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--151-magenta-500)]">
            {t(`pillars.${q.pillar}`)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--151-border-subtle)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--151-magenta-600)] to-[var(--151-magenta-400)] transition-[width] duration-300"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--151-text-primary)] mb-6">
            {t(`questions.${q.id}.q`)}
          </h3>

          <div className="space-y-3">
            {(["a", "b", "c", "d"] as const).map((key) => (
              <button
                key={key}
                onClick={() => selectAnswer(key)}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border transition-[background-color,box-shadow,transform] duration-200 text-sm",
                  currentAnswer === key
                    ? "border-[var(--151-magenta-500)] bg-[var(--151-magenta-500)]/10 text-[var(--151-text-primary)]"
                    : "border-[var(--151-border-subtle)] text-[var(--151-text-secondary)] hover:border-[var(--151-border-medium)] hover:text-[var(--151-text-primary)]"
                )}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3",
                  currentAnswer === key
                    ? "bg-[var(--151-magenta-500)] text-white"
                    : "bg-[var(--151-border-subtle)] text-[var(--151-text-muted)]"
                )}>
                  {key.toUpperCase()}
                </span>
                {t(`questions.${q.id}.${key}`)}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            currentQ === 0
              ? "text-[var(--151-text-muted)] cursor-not-allowed"
              : "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)]"
          )}
        >
          {t("previous")}
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            disabled={!currentAnswer}
            className="btn-glass-primary btn-glass-sm"
          >
            {t("next")}
          </button>
        ) : (
          <button
            onClick={() => allAnswered && setStage("results")}
            disabled={!allAnswered}
            className="btn-glass-primary btn-glass-sm"
          >
            {t("complete")}
          </button>
        )}
      </div>
    </div>
  );
}
