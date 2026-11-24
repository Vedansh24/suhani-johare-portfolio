"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { Activity } from "lucide-react";

interface RailNode {
  id: string;
  index: string;
  label: string;
}

const railNodes: RailNode[] = [
  { id: "hero", index: "01", label: "OVERVIEW" },
  { id: "equipment-lab", index: "02", label: "EQUIPMENT LAB" },
  { id: "experience", index: "03", label: "EXPERIENCE" },
  { id: "projects", index: "04", label: "PROJECTS" },
  { id: "skills", index: "05", label: "SKILLS" },
  { id: "education", index: "06", label: "EDUCATION" },
  { id: "contact", index: "07", label: "CONTACT" },
];

/**
 * VerticalECGRail - Fixed right xl:flex frosted rail.
 * 7 clickable section nodes with hover pills, moving vital dot, and live 00%-100% readout.
 */
export function VerticalECGRail() {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const trackRef = useRef<HTMLDivElement>(null);
  const vitalDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const pct = Math.round(self.progress * 100);
        setScrollDepth(pct);

        if (vitalDotRef.current && trackRef.current) {
          const trackHeight = trackRef.current.offsetHeight - 12;
          const yPos = self.progress * trackHeight;
          vitalDotRef.current.style.transform = `translateY(${yPos}px)`;
        }

        // Determine currently visible section
        const scrollPos = window.scrollY + window.innerHeight * 0.35;
        for (let i = railNodes.length - 1; i >= 0; i--) {
          const el = document.getElementById(railNodes[i].id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveSection(railNodes[i].id);
            break;
          }
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const handleNodeClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formattedDepth = String(scrollDepth).padStart(2, "0");

  return (
    <aside
      aria-label="Clinical Telemetry Rail"
      className="pointer-events-none fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-center select-none"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl border border-clinical-grid bg-white/90 p-3 shadow-clinical backdrop-blur-md">
        {/* Rail Top Heartbeat Header */}
        <div className="flex flex-col items-center gap-0.5 border-b border-clinical-grid/60 pb-2">
          <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-surgical-teal">
            <Activity className="h-3.5 w-3.5 text-vital-coral animate-pulse" />
            <span>ECG</span>
          </div>
          <span className="font-mono text-[8px] text-clinical-muted tracking-widest uppercase">
            LEAD II
          </span>
        </div>

        {/* 7 Section Nodes with Connected Vertical Track */}
        <div ref={trackRef} className="relative flex flex-col items-center gap-4 py-1">
          {/* Subtle Vertical Track Line */}
          <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2px] bg-clinical-grid rounded-full overflow-hidden">
            <div
              className="w-full bg-gradient-to-b from-surgical-teal to-medical-cobalt transition-all duration-150"
              style={{ height: `${scrollDepth}%` }}
            />
          </div>

          {/* Moving Coral Vital Dot */}
          <div
            ref={vitalDotRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 -ml-1.5 h-3 w-3 rounded-full bg-vital-coral shadow-glow-vital z-20 pointer-events-none transition-transform duration-75"
          />

          {/* 7 Interactive Section Nodes */}
          {railNodes.map((node) => {
            const isActive = activeSection === node.id;
            return (
              <div key={node.id} className="group relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleNodeClick(node.id)}
                  aria-label={`Jump to ${node.label}`}
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-surgical-teal bg-surgical-teal text-white shadow-2xs scale-110"
                      : "border-clinical-grid bg-white text-clinical-muted hover:border-surgical-teal/50 hover:text-clinical-ink"
                  }`}
                >
                  <span className="font-mono text-[9px] font-bold">{node.index}</span>
                </button>

                {/* Hover Tooltip Pill */}
                <div className="pointer-events-none absolute right-8 whitespace-nowrap rounded-md border border-clinical-grid bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-clinical-ink shadow-clinical opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                  <span className="text-surgical-teal mr-1.5">{node.index}</span>
                  {node.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Calibration Percentage Readout */}
        <div className="flex flex-col items-center border-t border-clinical-grid/60 pt-2 text-center">
          <span className="font-mono text-[11px] font-bold text-clinical-ink">
            {formattedDepth}%
          </span>
          <span className="font-mono text-[7px] tracking-widest text-clinical-muted uppercase">
            CALIBRATION
          </span>
        </div>
      </div>
    </aside>
  );
}

export default VerticalECGRail;
