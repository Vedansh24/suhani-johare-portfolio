"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef | null>(null);

  // Safely subscribe to prefers-reduced-motion without cascading re-renders
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot
  );

  // Synchronize Lenis RAF loop with GSAP ticker & bind ScrollTrigger updates
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;

    // Update ScrollTrigger on every Lenis scroll event
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    if (lenis) {
      lenis.on("scroll", handleScroll);
    }

    // Drive Lenis strictly via GSAP's central ticker
    const updateRaf = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (lenis) {
        lenis.off("scroll", handleScroll);
      }
      gsap.ticker.remove(updateRaf);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        lerp: isReducedMotion ? 1 : 0.08,
        smoothWheel: !isReducedMotion,
      }}
    >
      {children}
    </ReactLenis>
  );
}

export default SmoothScrollProvider;
