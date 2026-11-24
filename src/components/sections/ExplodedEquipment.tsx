"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalCard } from "@/components/ui/ClinicalCard";
import type { ICULayerSpec } from "@/data/resume";
import {
  Wrench,
  AlertTriangle,
  FileCheck2,
  Users2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Activity,
  Gauge,
} from "lucide-react";

interface ExplodedEquipmentProps {
  layers: ICULayerSpec[];
}

export function ExplodedEquipment({ layers }: ExplodedEquipmentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const stage3DRef = useRef<HTMLDivElement>(null);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [explosionProgress, setExplosionProgress] = useState(0);

  const tabLabels = [
    "01 Display Casing",
    "02 Sensor PCB",
    "03 Pneumatic Core",
    "04 Safety Power",
  ];

  const dutyBadges = ["IEC 60601", "ZERO DOWNTIME", "AUDIT READY", "SAFE OPS"];

  const dutyIcons = [
    <Wrench key="icon-0" className="h-5 w-5 text-surgical-teal" />,
    <AlertTriangle key="icon-1" className="h-5 w-5 text-vital-coral" />,
    <FileCheck2 key="icon-2" className="h-5 w-5 text-medical-cobalt" />,
    <Users2 key="icon-3" className="h-5 w-5 text-amber-500" />,
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // DESKTOP: >= 1024px PINNED SCROLL CHOREOGRAPHY
      mm.add("(min-width: 1024px)", () => {
        const pinSection = pinSectionRef.current;
        const stage3D = stage3DRef.current;
        if (!pinSection || !stage3D) return;

        // Pinned timeline with scrub
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinSection,
            pin: true,
            start: "top top",
            end: "+=1900",
            scrub: 1,
            onUpdate: (self) => {
              const progressPct = Math.round(self.progress * 100);
              setExplosionProgress(progressPct);
              const step = Math.min(3, Math.floor(self.progress * 4));
              setActiveLayerIndex(step);
            },
          },
        });

        // 1. Initial 3D Isometric Tilt
        tl.to(stage3D, {
          rotateX: 50,
          rotateZ: -30,
          duration: 0.8,
          ease: "power2.inOut",
        });

        // 2. Layer 1 (Display Bezel) explodes upward
        tl.to(
          ".plate-layer-0",
          {
            z: 220,
            y: -50,
            duration: 1.2,
            ease: "power1.inOut",
          },
          "-=0.4"
        );

        // 3. Layer 2 (Telemetry PCB) separates
        tl.to(
          ".plate-layer-1",
          {
            z: 75,
            y: -15,
            duration: 1.2,
            ease: "power1.inOut",
          },
          "-=0.9"
        );

        // 4. Layer 3 (Pneumatics & Manifold) drops slightly
        tl.to(
          ".plate-layer-2",
          {
            z: -70,
            y: 25,
            duration: 1.2,
            ease: "power1.inOut",
          },
          "-=0.9"
        );

        // 5. Layer 4 (Chassis Base) anchors downward
        tl.to(
          ".plate-layer-3",
          {
            z: -210,
            y: 65,
            duration: 1.2,
            ease: "power1.inOut",
          },
          "-=0.9"
        );

        // Leader line reveal
        tl.to(
          ".leader-lines-svg",
          {
            opacity: 1,
            duration: 0.5,
          },
          "-=0.6"
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const activeLayer = layers[activeLayerIndex] || layers[0];

  return (
    <section
      id="equipment-lab"
      ref={containerRef}
      className="relative bg-clinical-bg border-b border-clinical-grid blueprint-grid"
    >
      <div
        ref={pinSectionRef}
        className="min-h-screen flex flex-col justify-center py-12 lg:py-16 overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Section Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ClinicalBadge variant="teal" size="sm">
                  SHOWSTOPPER // SECTION 02
                </ClinicalBadge>
                <span className="font-mono text-xs text-clinical-muted">
                  3D ISOMETRIC ICU LIFE-SUPPORT ASSEMBLY
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-ink tracking-tight">
                Exploded ICU Equipment & Engineering Duties
              </h2>
              <p className="mt-1 text-sm sm:text-base text-clinical-muted max-w-2xl font-sans">
                Interactive exploded hardware breakdown synchronized with Suhani
                Johare&apos;s real hospital responsibilities at Vishesh Jupiter Hospital.
              </p>
            </div>

            {/* Step & Explosion Progress Readout */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 bg-white border border-clinical-grid px-3 py-1.5 rounded-lg shadow-2xs">
                <span className="text-clinical-muted">EXPLOSION:</span>
                <span className="font-bold text-surgical-teal">
                  {explosionProgress}%
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-surgical-teal/10 border border-surgical-teal/30 px-3 py-1.5 rounded-lg text-surgical-teal font-semibold">
                <span>STAGE 0{activeLayerIndex + 1} / 04</span>
              </div>
            </div>
          </div>

          {/* Subsystem Quick-Jump Navigation Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {tabLabels.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveLayerIndex(idx)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                  activeLayerIndex === idx
                    ? "border-surgical-teal bg-surgical-teal text-white font-semibold shadow-2xs"
                    : "border-clinical-grid bg-white text-clinical-muted hover:text-clinical-ink hover:bg-slate-50"
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] ${activeLayerIndex === idx ? "text-white/80" : "text-surgical-teal"}`}>
                  [{dutyBadges[idx]}]
                </span>
              </button>
            ))}
          </div>

          {/* Two-Column Choreography: 6-Col 3D Viewport + 6-Col Hospital Duty Spec Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* LEFT / CENTER STAGE (6 Cols): 3D Isometric Assembly Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[420px] sm:min-h-[480px] relative rounded-2xl border border-clinical-grid bg-white/90 p-6 sm:p-8 overflow-hidden shadow-clinical">
              {/* Corner Calibration Marks */}
              <div className="absolute top-3 left-3 font-mono text-[9px] text-clinical-muted">
                + ISOMETRIC: 1200px
              </div>
              <div className="absolute top-3 right-3 font-mono text-[9px] text-clinical-muted">
                AXIS: Y/Z EXPLODE
              </div>
              <div className="absolute bottom-3 left-3 font-mono text-[9px] text-surgical-teal font-semibold">
                ● ACTIVE LAYER: 0{activeLayerIndex + 1} {"//"} {tabLabels[activeLayerIndex]}
              </div>

              {/* Background Leader Lines SVG Overlay */}
              <svg
                className="leader-lines-svg pointer-events-none absolute inset-0 w-full h-full opacity-60 transition-opacity duration-300"
                viewBox="0 0 500 400"
                fill="none"
              >
                {/* L1 Leader */}
                <line x1="80" y1="80" x2="160" y2="120" stroke="#0D9488" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="80" cy="80" r="3" fill="#0D9488" />
                <text x="30" y="75" fill="#0D9488" fontSize="9" fontFamily="JetBrains Mono">L1 // CLINICAL UI</text>

                {/* L2 Leader */}
                <line x1="420" y1="130" x2="340" y2="170" stroke="#0284C7" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="420" cy="130" r="3" fill="#0284C7" />
                <text x="360" y="125" fill="#0284C7" fontSize="9" fontFamily="JetBrains Mono">L2 // SENSOR PCB</text>

                {/* L3 Leader */}
                <line x1="70" y1="280" x2="170" y2="230" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="70" cy="280" r="3" fill="#D97706" />
                <text x="20" y="295" fill="#D97706" fontSize="9" fontFamily="JetBrains Mono">L3 // PNEUMATIC CORE</text>

                {/* L4 Leader */}
                <line x1="420" y1="320" x2="330" y2="280" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="420" cy="320" r="3" fill="#475569" />
                <text x="340" y="335" fill="#475569" fontSize="9" fontFamily="JetBrains Mono">L4 // ISOLATED PSU</text>
              </svg>

              {/* 3D Scene Container */}
              <div className="exploded-stage w-full flex items-center justify-center py-6">
                <div
                  ref={stage3DRef}
                  style={{
                    transform: "rotateX(46deg) rotateZ(-26deg)",
                  }}
                  className="exploded-assembly relative w-64 h-48 sm:w-80 sm:h-56 transition-transform duration-500 ease-out"
                >
                  {/* LAYER 01: Front Sterile Housing // IPX4 (Top) */}
                  <div
                    onClick={() => setActiveLayerIndex(0)}
                    className={`plate-layer-0 equip-layer absolute inset-0 cursor-pointer rounded-xl border-2 p-3 flex flex-col justify-between shadow-clinical ${
                      activeLayerIndex === 0
                        ? "is-focused border-surgical-teal bg-white/95 ring-4 ring-surgical-teal/20"
                        : "border-slate-300 bg-white/85 hover:border-surgical-teal/60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-mono text-[9px] text-slate-700">
                      <span className="font-bold text-surgical-teal">[01] DISPLAY CASING</span>
                      <span className="text-slate-500">IPX4 STERILE BEZEL</span>
                    </div>

                    <div className="rounded-lg bg-slate-900 p-2 flex items-center justify-between text-emerald-400 font-mono text-[10px]">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 animate-pulse" />
                        <span>ECG II: 72 BPM</span>
                      </div>
                      <span className="text-sky-400 text-[9px]">SpO2 99%</span>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                      <span>SILICONE SEALED KEYPAD</span>
                      <span className="text-surgical-teal font-semibold">ALARM LED READY</span>
                    </div>
                  </div>

                  {/* LAYER 02: Signal Acquisition & Sensor PCB */}
                  <div
                    onClick={() => setActiveLayerIndex(1)}
                    className={`plate-layer-1 equip-layer absolute inset-0 cursor-pointer rounded-xl border-2 p-3 flex flex-col justify-between shadow-clinical ${
                      activeLayerIndex === 1
                        ? "is-focused border-surgical-teal bg-emerald-950/95 text-white ring-4 ring-surgical-teal/20"
                        : "border-slate-400 bg-[#0B251D]/90 text-emerald-100 hover:border-surgical-teal/60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-emerald-800 pb-1 font-mono text-[9px]">
                      <span className="font-bold text-emerald-400">[02] SENSOR PCB</span>
                      <span className="text-emerald-500">5kV OPTO-ISOLATION</span>
                    </div>

                    <div className="relative h-16 w-full rounded border border-emerald-800/80 bg-[#061812] p-2 flex items-center justify-around font-mono text-[8px] text-emerald-400">
                      <div className="rounded border border-emerald-600 p-1 bg-emerald-900/60">
                        INST-AMP
                      </div>
                      <span className="text-[10px] text-emerald-600">══</span>
                      <div className="rounded border border-emerald-600 p-1 bg-emerald-900/60">
                        24-BIT ADC
                      </div>
                      <span className="text-[10px] text-emerald-600">══</span>
                      <div className="rounded border border-amber-500 p-1 bg-amber-950/60 text-amber-300">
                        ISOLATED
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-mono text-emerald-400/90">
                      <span>LEAKAGE &lt;10µA</span>
                      <span>IEC 60601-1 PASS</span>
                    </div>
                  </div>

                  {/* LAYER 03: Pneumatic Flow Manifold // 45 PSI */}
                  <div
                    onClick={() => setActiveLayerIndex(2)}
                    className={`plate-layer-2 equip-layer absolute inset-0 cursor-pointer rounded-xl border-2 p-3 flex flex-col justify-between shadow-clinical ${
                      activeLayerIndex === 2
                        ? "is-focused border-amber-500 bg-slate-50/95 ring-4 ring-amber-500/20"
                        : "border-slate-300 bg-slate-100/85 hover:border-amber-500/60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1 font-mono text-[9px] text-slate-700">
                      <span className="font-bold text-amber-600">[03] PNEUMATIC CORE</span>
                      <span>FLOW BUS 45 PSI</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-1 text-center font-mono text-[8px] text-slate-700">
                      <div className="rounded border border-slate-300 bg-white p-1 flex flex-col items-center">
                        <Gauge className="h-3 w-3 text-medical-cobalt mb-0.5" />
                        <span>PRESSURE TX</span>
                      </div>
                      <div className="rounded border border-slate-300 bg-white p-1 flex flex-col items-center">
                        <Layers className="h-3 w-3 text-surgical-teal mb-0.5" />
                        <span>SOLENOID VALVES</span>
                      </div>
                      <div className="rounded border border-slate-300 bg-white p-1 flex flex-col items-center">
                        <Gauge className="h-3 w-3 text-amber-600 mb-0.5" />
                        <span>FLOW SENSORS</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                      <span>MICRO-TUBING 45 PSI</span>
                      <span>CALIBRATION VERIFIED</span>
                    </div>
                  </div>

                  {/* LAYER 04: ISO-60601 PSU & Battery Chassis (Base) */}
                  <div
                    onClick={() => setActiveLayerIndex(3)}
                    className={`plate-layer-3 equip-layer absolute inset-0 cursor-pointer rounded-xl border-2 p-3 flex flex-col justify-between shadow-clinical-lg ${
                      activeLayerIndex === 3
                        ? "is-focused border-surgical-teal bg-slate-900 text-white ring-4 ring-surgical-teal/20"
                        : "border-slate-700 bg-slate-800 text-slate-200 hover:border-surgical-teal/60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1 font-mono text-[9px]">
                      <span className="font-bold text-amber-400">[04] SAFETY POWER</span>
                      <span className="text-slate-400">ISOLATED PSU & CHASSIS</span>
                    </div>

                    <div className="rounded border border-slate-700 bg-slate-950 p-2 flex items-center justify-between font-mono text-[8px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-surgical-teal" />
                        <span>EARTH BOND RESISTANCE &lt;0.1Ω</span>
                      </div>
                      <span className="text-amber-400">LI-ION BACKUP</span>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                      <span>EQUIPOTENTIAL GROUND STUD</span>
                      <span className="text-emerald-400">NABH COMPLIANT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Callout Indicator Pin */}
              <div className="mt-4 flex items-center gap-2 rounded-full border border-surgical-teal/30 bg-white px-3.5 py-1 font-mono text-xs text-clinical-ink shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-surgical-teal animate-pulse" />
                <span>INSPECTING: {activeLayer.title}</span>
              </div>
            </div>

            {/* RIGHT STAGE (6 Cols): Synchronized Clinical Duty Specification Card */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <ClinicalCard
                cornerMarks
                calibrationRef={activeLayer.hospitalDutyRef}
                elevation="diagnostic"
                className="p-6 transition-all duration-300"
              >
                {/* Duty Category Tag & Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {dutyIcons[activeLayerIndex]}
                    <span className="font-mono text-xs font-bold text-surgical-teal">
                      {activeLayer.clinicalDomain}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-surgical-teal/10 border border-surgical-teal/30 px-2.5 py-0.5 font-mono text-xs font-bold text-surgical-teal">
                      {dutyBadges[activeLayerIndex]}
                    </span>
                    <span className="font-mono text-xs text-clinical-muted bg-clinical-grid/60 rounded px-2 py-0.5">
                      0{activeLayer.layerNumber} / 04
                    </span>
                  </div>
                </div>

                {/* Duty Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-clinical-ink leading-snug">
                  {activeLayer.dutyTitle}
                </h3>

                {/* Subsystem Tag */}
                <p className="mt-1 font-mono text-xs text-medical-cobalt">
                  Subsystem: {activeLayer.systemName}
                </p>

                {/* Real Hospital Duty Description from Resume */}
                <p className="mt-3 text-sm text-clinical-muted leading-relaxed">
                  {activeLayer.dutyDescription}
                </p>

                {/* Detailed Telemetry Callouts Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 pt-3 border-t border-clinical-grid font-mono text-xs">
                  <div className="rounded-lg bg-slate-50 border border-clinical-grid p-2.5">
                    <span className="text-[10px] text-clinical-muted block">HOSPITAL PROTOCOL:</span>
                    <span className="font-semibold text-clinical-ink text-[11px] mt-0.5 block">
                      {activeLayer.technicalSpecs.protocol}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-clinical-grid p-2.5">
                    <span className="text-[10px] text-clinical-muted block">SUBSYSTEM COMPONENT:</span>
                    <span className="font-semibold text-clinical-ink text-[11px] mt-0.5 block">
                      {activeLayer.technicalSpecs.component}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-clinical-grid p-2.5">
                    <span className="text-[10px] text-clinical-muted block">INSPECTION METRIC:</span>
                    <span className="font-semibold text-surgical-teal text-[11px] mt-0.5 block">
                      {activeLayer.technicalSpecs.inspectionMetric}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-clinical-grid p-2.5">
                    <span className="text-[10px] text-clinical-muted block">CLINICAL DOMAIN:</span>
                    <span className="font-semibold text-clinical-ink text-[11px] mt-0.5 block">
                      {activeLayer.clinicalDomain}
                    </span>
                  </div>
                </div>

                {/* Navigation CTA between layers */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-clinical-grid/60">
                  <span className="font-mono text-[11px] text-clinical-muted">
                    VISHESH JUPITER HOSPITAL · BIOMEDICAL ENGINEERING
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveLayerIndex((prev) => (prev + 1) % 4)}
                    className="flex items-center gap-1 font-mono text-xs font-bold text-surgical-teal hover:underline cursor-pointer"
                  >
                    <span>NEXT SUBSYSTEM</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </ClinicalCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExplodedEquipment;
