"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { Activity } from "lucide-react";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

export function ClinicalPreloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ecgPathRef = useRef<SVGPathElement>(null);
  const peakDotRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [complete, setComplete] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerSnapshot
  );

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    const container = containerRef.current;
    const ecgPath = ecgPathRef.current;
    if (!container || !ecgPath) return;

    const pathLength = ecgPath.getTotalLength();
    gsap.set(ecgPath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        setComplete(true);
      },
    });

    // 1. ECG path draws left-to-right (0.55s)
    tl.to(ecgPath, {
      strokeDashoffset: 0,
      duration: 0.55,
      ease: "power2.inOut",
    });

    // 2. Pulse peak dot and label reveal
    tl.to(
      peakDotRef.current,
      {
        opacity: 1,
        scale: 1.25,
        duration: 0.18,
        yoyo: true,
        repeat: 2,
        ease: "power1.inOut",
      },
      "-=0.2"
    );

    tl.to(
      textRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: "power2.out",
      },
      "-=0.15"
    );

    // 3. Crisp upward curtain wipe (total elapsed ~1.08s)
    tl.to(container, {
      yPercent: -100,
      duration: 0.42,
      ease: "power3.inOut",
      delay: 0.15,
    });

    return () => {
      tl.kill();
    };
  }, [prefersReducedMotion]);

  if (complete || prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-clinical-bg select-none pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6 px-6 max-w-md w-full">
        {/* Telemetry Boot Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-surgical-teal/30 bg-surgical-teal/10 px-3.5 py-1 text-[11px] font-mono font-semibold tracking-wider text-surgical-teal">
          <span className="h-2 w-2 rounded-full bg-surgical-teal animate-ping" />
          <span>BIOMEDICAL TELEMETRY BOOT</span>
        </div>

        {/* ECG Lead II Vector with Pulsing Peak Dot */}
        <div className="relative w-full h-20 flex items-center justify-center">
          <svg
            viewBox="0 0 320 80"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            {/* Faint Background Calibration Grid Hairlines */}
            <path
              d="M 0 40 L 40 40 L 50 36 L 55 42 L 65 40 L 90 40 L 100 24 L 110 56 L 120 8 L 130 68 L 140 40 L 160 40 L 180 32 L 200 40 L 230 40 L 240 24 L 250 56 L 260 8 L 270 68 L 280 40 L 320 40"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated Surgical Teal ECG Sweep */}
            <path
              ref={ecgPathRef}
              d="M 0 40 L 40 40 L 50 36 L 55 42 L 65 40 L 90 40 L 100 24 L 110 56 L 120 8 L 130 68 L 140 40 L 160 40 L 180 32 L 200 40 L 230 40 L 240 24 L 250 56 L 260 8 L 270 68 L 280 40 L 320 40"
              stroke="#0D9488"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Pulsing Vital Coral Peak Dot aligned at R-peak (x=120/320, y=8/80) */}
          <div
            ref={peakDotRef}
            className="absolute left-[37.5%] top-[10%] -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-vital-coral shadow-glow-vital opacity-0"
          />
        </div>

        {/* Monospace Calibration Readout */}
        <div
          ref={textRef}
          className="flex flex-col items-center gap-1.5 opacity-0 translate-y-2 text-center"
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-clinical-ink">
            <Activity className="h-3.5 w-3.5 text-surgical-teal animate-pulse" />
            <span>SYSTEM CALIBRATED // SUHANI JOHARE</span>
          </div>
          <span className="font-mono text-[11px] text-clinical-muted">
            VISHESH JUPITER HOSPITAL · INDORE, INDIA · SGSITS ALUMNA
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClinicalPreloader;
