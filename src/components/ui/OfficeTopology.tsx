"use client";

import { Suspense, lazy, useRef, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/components/ThemeProvider";

// Lazy load Three.js only on desktop — heavy dependency
const Scene = lazy(() => import("./OfficeScene"));

function SceneFallback() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--151-text-primary) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

export function OfficeTopology() {
  const prefersReduced = useReducedMotion();
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === "dark";
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // For OfficeScene, we want it to fade IN as we scroll DOWN to it.
    // The Hero section handles the first 100vh.
    function onScroll() {
      if (!el) return;
      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      // Phase 1: Fade IN — glued to datacenter floor exit
      const fadeInStart = vh * 0.2;
      const fadeInEnd = vh * 0.45;

      // Phase 2: Fade OUT — when scrolling past the office section
      const fadeOutStart = vh * 1.0;
      const fadeOutEnd = vh * 1.5;

      let opacity: number;
      if (scrollY < fadeInStart) {
        opacity = 0;
      } else if (scrollY < fadeInEnd) {
        const frac = (scrollY - fadeInStart) / (fadeInEnd - fadeInStart);
        opacity = frac < 0.5 ? 2 * frac * frac : 1 - Math.pow(-2 * frac + 2, 2) / 2;
      } else if (scrollY < fadeOutStart) {
        opacity = 1;
      } else if (scrollY < fadeOutEnd) {
        const outFrac = (scrollY - fadeOutStart) / (fadeOutEnd - fadeOutStart);
        opacity = Math.max(1 - outFrac * outFrac, 0);
      } else {
        opacity = 0;
      }
      el.style.opacity = String(opacity);
    }

    // Initial call
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Don't render on reduced motion or SSR
  if (prefersReduced) return null;

  return (
    <div
      ref={divRef}
      className="absolute inset-0"
      aria-hidden="true"
      style={{ opacity: 0, transition: "opacity 0.1s ease-out" }} // Quick transition as it's scroll-linked
    >
      <Suspense fallback={<SceneFallback />}>
        <Scene isDark={isDark} />
      </Suspense>
    </div>
  );
}
