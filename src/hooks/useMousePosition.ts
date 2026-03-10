"use client";

import { useState, useEffect } from "react";

/**
 * Tracks normalized mouse position from -1 to 1 relative to the viewport center.
 * Returns { x: 0, y: 0 } on SSR and when no mouse movement detected.
 */
export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      // Only respond to actual mouse input — ignore touch/pen to prevent
      // mobile taps from panning the 3D camera
      if (e.pointerType !== "mouse") return;
      setPosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return position;
}
