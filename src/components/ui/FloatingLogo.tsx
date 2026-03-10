"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Scroll-aware logo handoff between hero and navbar.
 *
 * The hero logo scrolls naturally with the page content. Once it exits the
 * viewport, the navbar logo fades in smoothly. No fixed-position clone,
 * no interpolation, no motion blur — just a clean cross-fade.
 *
 * Relies on two DOM slots:
 *   #hero-logo-slot — wraps the hero Logo151 (in content flow, scrolls normally)
 *   #nav-logo-slot  — wraps the navbar Logo151 (inside fixed header)
 */
export function FloatingLogo() {
  // Immediately hide nav logo on home page before first paint
  useLayoutEffect(() => {
    const navSlot = document.getElementById("nav-logo-slot");
    const heroSlot = document.getElementById("hero-logo-slot");
    if (navSlot && heroSlot) {
      navSlot.style.opacity = "0";
      navSlot.style.transition = "opacity 0.35s ease";
    }
  }, []);

  useEffect(() => {
    const heroSlot = document.getElementById("hero-logo-slot");
    const navSlot = document.getElementById("nav-logo-slot");
    if (!heroSlot || !navSlot) return;

    function update() {
      if (!heroSlot || !navSlot) return;

      const heroRect = heroSlot.getBoundingClientRect();
      // Hero logo is "gone" when its bottom edge is above the navbar area (~64px)
      const gone = heroRect.bottom < 64;

      navSlot.style.opacity = gone ? "1" : "0";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Initial check (e.g. if page loaded already scrolled)
    requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      // Restore slot visibility on unmount (navigating away from home)
      if (navSlot) {
        navSlot.style.opacity = "";
        navSlot.style.transition = "";
      }
    };
  }, []);

  // No rendered element — the hero logo stays in document flow
  return null;
}
