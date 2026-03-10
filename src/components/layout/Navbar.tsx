"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useNavScroll } from "@/hooks/useNavScroll";
import { cn } from "@/lib/cn";
import { Logo151 } from "@/components/ui/Logo151";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/scope", key: "scope" },
  { href: "/methodology", key: "methodology" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/diagnostic", key: "diagnostic" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const scrolled = useNavScroll(50);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Escape key + focus trap
  useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMobile();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    // Lock body scroll
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--151-magenta-500)] focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "nav-glass fixed top-0 left-0 right-0 z-50",
          scrolled && "scrolled"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span id="nav-logo-slot">
                <Logo151 size="sm" />
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)]",
                    "hover:bg-[var(--151-border-subtle)]",
                    // Underline animation
                    "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5",
                    "after:bg-[var(--151-magenta-500)] after:origin-left after:scale-x-0",
                    "after:transition-transform after:duration-300 hover:after:scale-x-100"
                  )}
                >
                  {t(key)}
                </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1">
              <LocaleSwitcher className="hidden sm:block" />
              <ThemeToggle />

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg",
                  "hover:bg-[var(--151-border-subtle)] transition-colors"
                )}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <span
                  className={cn(
                    "w-5 h-0.5 bg-current transition-transform duration-200",
                    "text-[var(--151-text-secondary)]",
                    mobileOpen && "translate-y-[4px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "w-5 h-0.5 bg-current transition-transform duration-200",
                    "text-[var(--151-text-secondary)]",
                    mobileOpen && "-translate-y-[4px] -rotate-45"
                  )}
                />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 z-40 pt-16 md:hidden",
              "bg-[var(--151-bg-primary)]/95 backdrop-blur-xl"
            )}
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map(({ href, key }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={href}
                    onClick={closeMobile}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                      "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)]",
                      "hover:bg-[var(--151-border-subtle)]"
                    )}
                  >
                    {t(key)}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 pt-4 border-t border-[var(--151-border-subtle)]">
                <LocaleSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
