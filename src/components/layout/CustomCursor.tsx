"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";

function subscribePointer(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(hover: hover) and (pointer: fine)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getPointerSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * CustomCursor - Desktop-only medical reticle crosshair cursor.
 * Uses gsap.quickTo() for lag-free 60fps tracking.
 * 34px teal ring expanding to 52px cobalt with crosshair ticks and coral dot on interactive targets.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  const isPointerFine = useSyncExternalStore(
    subscribePointer,
    getPointerSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (!isPointerFine) return;

    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    const xTo = gsap.quickTo(cursorEl, "x", { duration: 0.12, ease: "power2.out" });
    const yTo = gsap.quickTo(cursorEl, "y", { duration: 0.12, ease: "power2.out" });

    const handlePointerMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(cursorEl, { opacity: 1, duration: 0.15 });
    };

    const handlePointerLeave = () => {
      gsap.to(cursorEl, { opacity: 0, duration: 0.2 });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, select, .interactive-target, [data-interactive='true']"
      );
      setIsInteractive(!!interactive);
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handlePointerLeave);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isPointerFine]);

  if (!isPointerFine) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 select-none opacity-0"
      aria-hidden="true"
    >
      <div
        className={`relative flex items-center justify-center transition-all duration-200 ease-out ${
          isInteractive ? "h-[52px] w-[52px]" : "h-[34px] w-[34px]"
        }`}
      >
        {/* Reticle Circular Ring */}
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-200 ${
            isInteractive
              ? "border-medical-cobalt bg-medical-cobalt/5 shadow-glow-teal scale-100"
              : "border-surgical-teal/60 scale-95"
          }`}
        />

        {/* 4 Precision Crosshair Ticks (12, 3, 6, 9 o'clock) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Top tick */}
          <span
            className={`absolute top-0 h-1.5 w-[1.5px] transition-colors ${
              isInteractive ? "bg-medical-cobalt" : "bg-surgical-teal/70"
            }`}
          />
          {/* Bottom tick */}
          <span
            className={`absolute bottom-0 h-1.5 w-[1.5px] transition-colors ${
              isInteractive ? "bg-medical-cobalt" : "bg-surgical-teal/70"
            }`}
          />
          {/* Left tick */}
          <span
            className={`absolute left-0 w-1.5 h-[1.5px] transition-colors ${
              isInteractive ? "bg-medical-cobalt" : "bg-surgical-teal/70"
            }`}
          />
          {/* Right tick */}
          <span
            className={`absolute right-0 w-1.5 h-[1.5px] transition-colors ${
              isInteractive ? "bg-medical-cobalt" : "bg-surgical-teal/70"
            }`}
          />
        </div>

        {/* Central Precision Dot (turns vital-coral on interactive targets) */}
        <div
          className={`rounded-full transition-all duration-150 ${
            isInteractive
              ? "h-2 w-2 bg-vital-coral shadow-glow-vital"
              : "h-1.5 w-1.5 bg-surgical-teal/90"
          }`}
        />
      </div>
    </div>
  );
}

export default CustomCursor;
