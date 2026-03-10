"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    close();
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium",
          "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)]",
          "hover:bg-[var(--151-border-subtle)] transition-colors duration-200"
        )}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {locale.toUpperCase()}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Select language"
            className={cn(
              "absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg",
              "bg-[var(--151-bg-elevated)] border border-[var(--151-border-subtle)]",
              "shadow-lg z-50"
            )}
          >
            {locales.map((l) => (
              <button
                key={l}
                role="option"
                aria-selected={l === locale}
                onClick={() => switchLocale(l)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors",
                  l === locale
                    ? "text-[var(--151-magenta-500)] font-medium"
                    : "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)] hover:bg-[var(--151-border-subtle)]"
                )}
              >
                {localeNames[l]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
