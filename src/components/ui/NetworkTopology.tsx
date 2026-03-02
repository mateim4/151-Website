"use client";

import { useRef, useMemo, Suspense, lazy } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy load Three.js only on desktop — heavy dependency
const Scene = lazy(() => import("./NetworkScene"));

export function NetworkTopology() {
  const prefersReduced = useReducedMotion();

  // Don't render on reduced motion or SSR
  if (prefersReduced) return null;

  return (
    <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </div>
  );
}
