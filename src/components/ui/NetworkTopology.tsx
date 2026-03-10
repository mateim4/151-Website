"use client";

import { Suspense, lazy, useRef, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/components/ThemeProvider";

// Lazy load Three.js only on desktop — heavy dependency
// Original constellation: lazy(() => import("./NetworkScene"))
const Scene = lazy(() => import("./DatacenterScene"));

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

export function NetworkTopology() {
  const prefersReduced = useReducedMotion();
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === "dark";
  const divRef = useRef<HTMLDivElement>(null);
  const fadeInDone = useRef(false);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // E1: Fade in after mount
    const raf = requestAnimationFrame(() => {
      el.style.opacity = "1";
    });
    const fadeTimer = setTimeout(() => {
      fadeInDone.current = true;
      el.style.transition = "none";
    }, 1700);

    // B1: Scroll-linked opacity fade (after fade-in completes)
    function onScroll() {
      if (!fadeInDone.current || !el) return;
      const frac = Math.min(window.scrollY / window.innerHeight, 1);
      // Quadratic curve: scene stays visible longer during dolly-down, then fades quickly
      el.style.opacity = String(Math.max(1 - frac * frac, 0));
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fadeTimer);
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
      style={{ opacity: 0, transition: "opacity 1.5s ease-out" }}
    >
      <Suspense fallback={<SceneFallback />}>
        <Scene isDark={isDark} />
      </Suspense>
      {/* Blur zone behind navbar — inside scene container so it can blur the WebGL canvas */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          zIndex: 1,
          backdropFilter: "blur(48px)",
          WebkitBackdropFilter: "blur(48px)",
          maskImage: "linear-gradient(to bottom, black 50%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent)",
        }}
      />
    </div>
  );
}
