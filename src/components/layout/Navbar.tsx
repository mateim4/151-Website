"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) closeMobile();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
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
              <Logo151 size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)]",
                    "hover:bg-[var(--151-border-subtle)]"
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
      {mobileOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 pt-16 md:hidden",
            "bg-[var(--151-bg-primary)]/95 backdrop-blur-xl"
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                  "text-[var(--151-text-secondary)] hover:text-[var(--151-text-primary)]",
                  "hover:bg-[var(--151-border-subtle)]"
                )}
              >
                {t(key)}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-[var(--151-border-subtle)]">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
