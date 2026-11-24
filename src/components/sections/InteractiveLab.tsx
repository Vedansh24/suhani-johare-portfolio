"use client";

import { useState, useRef, useEffect } from "react";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalCard } from "@/components/ui/ClinicalCard";
import type { AcademicProject } from "@/data/resume";
import {
  Eye,
  Siren,
  Film,
  Radio,
  Zap,
} from "lucide-react";

interface InteractiveLabProps {
  projects?: AcademicProject[];
}

export function InteractiveLab({}: InteractiveLabProps) {
  // 1. Vein Detector Simulation State
  const [veinMode, setVeinMode] = useState<"lens" | "full">("lens");
  const [lensPos, setLensPos] = useState({ x: 180, y: 95 });
  const [isPointerInsideVein, setIsPointerInsideVein] = useState(false);
  const veinViewportRef = useRef<HTMLDivElement>(null);

  // Auto-sweep lens when user isn't hovering
  useEffect(() => {
    if (isPointerInsideVein || veinMode === "full") return;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.04;
      const x = 180 + Math.sin(t) * 90;
      const y = 95 + Math.cos(t * 1.5) * 25;
      setLensPos({ x, y });
    }, 40);
    return () => clearInterval(interval);
  }, [isPointerInsideVein, veinMode]);

  // 2. Rescue Ready Radar State
  const [userRole, setUserRole] = useState<"DISPATCHER" | "HOSPITAL ER" | "AMBULANCE">("DISPATCHER");
  const [priorityRoute, setPriorityRoute] = useState(true);
  const [ambulanceProgress, setAmbulanceProgress] = useState(0.35);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulanceProgress((prev) => (prev >= 0.96 ? 0.04 : prev + (priorityRoute ? 0.035 : 0.018)));
    }, 300);
    return () => clearInterval(interval);
  }, [priorityRoute]);

  // Ambulance coordinate on curved route
  const getAmbulanceCoord = (pct: number) => {
    // S-curve route from (40, 140) to (320, 40)
    const x = 40 + pct * 280;
    const y = 140 - Math.sin(pct * Math.PI) * 60 - pct * 60;
    return { x, y };
  };

  const ambPos = getAmbulanceCoord(ambulanceProgress);

  // 3. Motion Detector PIR State
  const [isMotionTriggered, setIsMotionTriggered] = useState(false);
  const [triggerCount, setTriggerCount] = useState(4);
  const [lastTriggerTime, setLastTriggerTime] = useState("12:04:18");
  const pirTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePirMove = () => {
    setIsMotionTriggered(true);
    setTriggerCount((c) => c + 1);
    const now = new Date();
    setLastTriggerTime(
      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
    );

    if (pirTimeoutRef.current) clearTimeout(pirTimeoutRef.current);
    pirTimeoutRef.current = setTimeout(() => {
      setIsMotionTriggered(false);
    }, 1200);
  };

  // 4. Movie Recommendation System Cosine Graph State (6 Nodes)
  const movieNodes = [
    { id: "m1", title: "Inception", genre: "Sci-Fi / Mind", x: 70, y: 50 },
    { id: "m2", title: "Interstellar", genre: "Sci-Fi / Space", x: 190, y: 35 },
    { id: "m3", title: "The Matrix", genre: "Sci-Fi / Cyber", x: 300, y: 65 },
    { id: "m4", title: "Arrival", genre: "Sci-Fi / Linguistics", x: 80, y: 145 },
    { id: "m5", title: "The Dark Knight", genre: "Action / Noir", x: 200, y: 155 },
    { id: "m6", title: "Tenet", genre: "Sci-Fi / Entropy", x: 310, y: 145 },
  ];

  const [selectedMovieId, setSelectedMovieId] = useState("m1");

  const similarityDatabase: Record<string, { target: string; targetId: string; score: number; rationale: string }[]> = {
    m1: [
      { target: "Interstellar", targetId: "m2", score: 0.94, rationale: "Nolan directorial style, Hans Zimmer score, high-concept physics" },
      { target: "Tenet", targetId: "m6", score: 0.92, rationale: "Time manipulation mechanics, non-linear pacing, espionage thriller" },
      { target: "The Matrix", targetId: "m3", score: 0.88, rationale: "Reality distortion, existential queries, virtual consciousness" },
    ],
    m2: [
      { target: "Inception", targetId: "m1", score: 0.94, rationale: "Nolan ensemble cast, epic temporal stakes, emotional core" },
      { target: "Arrival", targetId: "m4", score: 0.89, rationale: "Theoretical space-time physics, extraterrestrial communication" },
      { target: "Tenet", targetId: "m6", score: 0.84, rationale: "Gravitational & temporal anomalies, Kip Thorne consultant alignment" },
    ],
    m3: [
      { target: "Inception", targetId: "m1", score: 0.88, rationale: "Nested reality constructs, human agency vs algorithmic illusion" },
      { target: "Tenet", targetId: "m6", score: 0.82, rationale: "High-octane philosophical sci-fi action choreography" },
      { target: "Arrival", targetId: "m4", score: 0.79, rationale: "Cognitive perception of time and deterministic reality" },
    ],
    m4: [
      { target: "Interstellar", targetId: "m2", score: 0.89, rationale: "Deep emotional resonance, human survival, speculative science" },
      { target: "Inception", targetId: "m1", score: 0.84, rationale: "Complex cognitive architecture, non-linear memory recall" },
      { target: "The Matrix", targetId: "m3", score: 0.79, rationale: "Language as reality determinant, human-alien interface" },
    ],
    m5: [
      { target: "Inception", targetId: "m1", score: 0.91, rationale: "Nolan architectural cinematography, Wally Pfister visual style" },
      { target: "Tenet", targetId: "m6", score: 0.85, rationale: "High-stakes tactical operations, Ludwig Göransson & Zimmer motifs" },
      { target: "Interstellar", targetId: "m2", score: 0.78, rationale: "Moral dilemmas under extreme pressure, sacrifice themes" },
    ],
    m6: [
      { target: "Inception", targetId: "m1", score: 0.92, rationale: "Precision puzzle-box narrative, inverted chronology, espionage" },
      { target: "Interstellar", targetId: "m2", score: 0.84, rationale: "Thermodynamic entropy, relativistic physics, global stakes" },
      { target: "The Dark Knight", targetId: "m5", score: 0.85, rationale: "Complex villain motivation, IMAX action choreography" },
    ],
  };

  const currentSimilarities = similarityDatabase[selectedMovieId] || similarityDatabase["m1"];
  const activeMovieObj = movieNodes.find((m) => m.id === selectedMovieId);

  // Helper for Vein Scanner mouse positioning
  const handleVeinPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!veinViewportRef.current) return;
    const rect = veinViewportRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));
    setLensPos({ x, y });
    setIsPointerInsideVein(true);
  };

  return (
    <section id="projects" className="py-24 border-b border-clinical-grid bg-blueprint-grid relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <ClinicalBadge variant="teal" size="sm">
              MODULE 04 // INTERACTIVE LAB
            </ClinicalBadge>
            <span className="font-mono text-xs text-clinical-muted">
              TACTILE MEDTECH & ML BENCH
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-ink tracking-tight">
            Interactive Engineering & Algorithms Lab
          </h2>
          <p className="mt-2 text-sm sm:text-base text-clinical-muted leading-relaxed font-sans">
            Tactile, live bench simulations of Suhani Johare&apos;s 3 academic projects
            and YBI Foundation machine learning recommendation system.
          </p>
        </div>

        {/* 12-Column Bento Grid: Top Row (7 + 5 Cols), Bottom Row (6 + 6 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ======================================================== */}
          {/* BENTO CARD 1: VEIN DETECTOR (MATLAB) - 7 COLS           */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex">
            <ClinicalCard
              cornerMarks
              calibrationRef="PROJECT 01 // MATLAB IMAGE PROCESSING"
              elevation="diagnostic"
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-surgical-teal flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    Vein Detector (2023–2024)
                  </span>
                  <span className="font-mono text-[10px] text-clinical-muted border border-clinical-grid rounded px-2 py-0.5">
                    Mentor: Mr. Sunny Ganavdiya
                  </span>
                </div>

                <h3 className="text-xl font-bold text-clinical-ink leading-snug">
                  Near-Infrared (NIR) Subcutaneous Vein Scanner
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-clinical-muted leading-relaxed">
                  Developed in MATLAB using adaptive thresholding and contrast-limited histogram equalization (CLAHE)
                  to enhance subcutaneous veins from 850nm NIR frames, easing venipuncture and IV line access.
                </p>

                {/* Simulation Mode Controls */}
                <div className="my-3 flex items-center justify-between font-mono text-xs">
                  <span className="text-clinical-muted text-[11px]">OPTICAL TRANSILLUMINATION:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setVeinMode("lens")}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                        veinMode === "lens"
                          ? "bg-surgical-teal text-white shadow-2xs"
                          : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
                      }`}
                    >
                      [SCANNER LENS]
                    </button>
                    <button
                      type="button"
                      onClick={() => setVeinMode("full")}
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                        veinMode === "full"
                          ? "bg-surgical-teal text-white shadow-2xs"
                          : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
                      }`}
                    >
                      [FULL NIR VIEW]
                    </button>
                  </div>
                </div>

                {/* Interactive Scanning Viewport */}
                <div
                  ref={veinViewportRef}
                  onPointerMove={handleVeinPointerMove}
                  onPointerEnter={() => setIsPointerInsideVein(true)}
                  onPointerLeave={() => setIsPointerInsideVein(false)}
                  className="relative h-56 sm:h-64 w-full rounded-xl border border-clinical-grid bg-slate-100 overflow-hidden cursor-crosshair select-none shadow-2xs"
                >
                  {/* Forearm Surface Skin boundary */}
                  <svg
                    viewBox="0 0 360 200"
                    className="absolute inset-0 w-full h-full"
                    fill="none"
                  >
                    <path
                      d="M 20 60 C 90 50, 220 55, 340 70 L 340 145 C 220 160, 90 165, 20 155 Z"
                      fill="#F1F5F9"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                    />
                    <text x="30" y="45" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono">
                      DORSAL FOREARM ARCH // 850nm NIR FILTER
                    </text>
                  </svg>

                  {/* Subcutaneous Vein Tree Pathways (Revealed by Lens / Full NIR) */}
                  <div
                    style={{
                      clipPath:
                        veinMode === "full"
                          ? "none"
                          : `circle(54px at ${lensPos.x}px ${lensPos.y}px)`,
                    }}
                    className="absolute inset-0 w-full h-full transition-[clip-path] duration-75"
                  >
                    <svg
                      viewBox="0 0 360 200"
                      className="w-full h-full"
                      fill="none"
                    >
                      {/* Cephalic Vein */}
                      <path
                        d="M 30 85 Q 100 80 150 95 T 240 100 T 330 105"
                        stroke="#0D9488"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {/* Basilic Vein */}
                      <path
                        d="M 40 125 Q 110 130 170 120 T 250 125 T 330 135"
                        stroke="#0D9488"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Median Cubital Anastomosis */}
                      <path
                        d="M 150 95 C 170 105, 190 115, 210 122"
                        stroke="#14B8A6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Tributaries */}
                      <path
                        d="M 90 83 Q 110 70 140 75"
                        stroke="#0D9488"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 240 100 Q 270 90 300 92"
                        stroke="#0D9488"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 180 121 Q 200 135 230 138"
                        stroke="#14B8A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Glowing Circular Lens Overlay */}
                  {veinMode === "lens" && (
                    <div
                      style={{
                        left: `${lensPos.x}px`,
                        top: `${lensPos.y}px`,
                      }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-2 border-surgical-teal shadow-glow-teal flex items-center justify-center font-mono text-[8px] text-surgical-teal"
                    >
                      <span className="absolute top-1 font-bold">NIR 850nm</span>
                      <div className="h-2 w-2 rounded-full bg-surgical-teal animate-ping" />
                      <span className="absolute bottom-1 font-semibold">±0.2mm DEPTH</span>
                    </div>
                  )}

                  {/* Corner Status Pill */}
                  <div className="absolute bottom-2.5 left-3 font-mono text-[10px] text-surgical-teal font-semibold flex items-center gap-1.5 bg-white/90 border border-clinical-grid px-2.5 py-0.5 rounded shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-surgical-teal animate-pulse" />
                    <span>
                      {veinMode === "lens"
                        ? "HOVER TO SCAN SUBCUTANEOUS VEINS"
                        : "FULL 850nm CONTRAST MAPPED"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs text-clinical-muted">
                <span>Tool: MATLAB Image Processing</span>
                <span className="text-surgical-teal font-bold">VASCULAR ACCESS AID</span>
              </div>
            </ClinicalCard>
          </div>

          {/* ======================================================== */}
          {/* BENTO CARD 2: RESCUE READY (Django) - 5 COLS            */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex">
            <ClinicalCard
              cornerMarks
              calibrationRef="PROJECT 02 // DJANGO TELEMETRY"
              elevation="diagnostic"
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-medical-cobalt flex items-center gap-1.5">
                    <Siren className="h-4 w-4" />
                    Rescue Ready (2024–2025)
                  </span>
                  <span className="font-mono text-[10px] text-clinical-muted border border-clinical-grid rounded px-2 py-0.5">
                    Mentor: Mr. Vinay Manurkar
                  </span>
                </div>

                <h3 className="text-xl font-bold text-clinical-ink leading-snug">
                  Ambulance Dispatch & Triage Radar
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-clinical-muted leading-relaxed">
                  Django web portal coordinating hospital trauma centers with on-duty ambulances,
                  featuring live GPS route sync and preliminary vitals handover.
                </p>

                {/* Role Switcher & Priority Corridor Toggle */}
                <div className="my-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-1">
                    {(["DISPATCHER", "HOSPITAL ER", "AMBULANCE"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setUserRole(role)}
                        className={`rounded px-2 py-0.5 text-[9px] font-semibold transition-all cursor-pointer ${
                          userRole === role
                            ? "bg-medical-cobalt text-white shadow-2xs"
                            : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPriorityRoute(!priorityRoute)}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                      priorityRoute
                        ? "bg-vital-coral text-white shadow-2xs"
                        : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
                    }`}
                  >
                    {priorityRoute ? "SIREN ON // GREEN CORRIDOR" : "STANDARD DISPATCH"}
                  </button>
                </div>

                {/* Radar Map Canvas Simulation */}
                <div className="relative h-56 sm:h-64 w-full rounded-xl border border-clinical-grid bg-slate-50 p-2 overflow-hidden shadow-2xs">
                  <svg
                    viewBox="0 0 360 200"
                    className="w-full h-full"
                    fill="none"
                  >
                    {/* Road Network Grid */}
                    <line x1="20" y1="140" x2="340" y2="140" stroke="#E2E8F0" strokeWidth="6" />
                    <line x1="180" y1="20" x2="180" y2="180" stroke="#E2E8F0" strokeWidth="6" />
                    <line x1="20" y1="60" x2="340" y2="60" stroke="#E2E8F0" strokeWidth="4" />

                    {/* S-Curve Ambulance Travel Path */}
                    <path
                      d="M 40 140 Q 120 70 200 90 T 320 40"
                      stroke={priorityRoute ? "#EF4444" : "#0284C7"}
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />

                    {/* Hospital ER Beacon Node */}
                    <circle cx="320" cy="40" r="14" fill="#0284C7" fillOpacity="0.15" />
                    <circle cx="320" cy="40" r="6" fill="#0284C7" />
                    <text x="250" y="28" fill="#0284C7" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
                      VISHESH JUPITER ER
                    </text>

                    {/* Dispatch Station Node */}
                    <circle cx="40" cy="140" r="5" fill="#64748B" />
                    <text x="20" y="165" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">
                      DEPOT 01
                    </text>

                    {/* Moving Ambulance Vector Icon */}
                    <g transform={`translate(${ambPos.x - 12}, ${ambPos.y - 12})`}>
                      <circle cx="12" cy="12" r="12" fill={priorityRoute ? "#EF4444" : "#0284C7"} />
                      <text x="6" y="16" fill="white" fontSize="10" fontWeight="bold">
                        🚑
                      </text>
                    </g>
                  </svg>

                  {/* Telemetry HUD Bottom Bar */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-white/95 border border-clinical-grid px-3 py-1.5 rounded-lg font-mono text-[11px] shadow-2xs">
                    <div className="flex items-center gap-1.5 text-clinical-ink">
                      <span className="h-2 w-2 rounded-full bg-surgical-teal animate-pulse" />
                      <span>ETA: {priorityRoute ? "03 MIN 12 SEC" : "07 MIN 45 SEC"}</span>
                    </div>
                    <span className="font-bold text-medical-cobalt">TRIAGE: LEVEL 1</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs text-clinical-muted">
                <span>Stack: Django, Python, SQLite</span>
                <span className="text-medical-cobalt font-bold">DISPATCH READY</span>
              </div>
            </ClinicalCard>
          </div>

          {/* ======================================================== */}
          {/* BENTO CARD 3: MOTION DETECTOR (PIR SENSOR) - 6 COLS      */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex">
            <ClinicalCard
              cornerMarks
              calibrationRef="PROJECT 03 // EMBEDDED TRANSDUCER"
              elevation="diagnostic"
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-vital-coral flex items-center gap-1.5">
                    <Radio className="h-4 w-4" />
                    Motion Detector (2022–2023)
                  </span>
                  <span className="font-mono text-[10px] text-clinical-muted border border-clinical-grid rounded px-2 py-0.5">
                    Mentor: Mr. Sunny Ganavdiya
                  </span>
                </div>

                <h3 className="text-xl font-bold text-clinical-ink leading-snug">
                  HC-SR501 Pyroelectric Infrared (PIR) Security Sensor
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-clinical-muted leading-relaxed">
                  Hardware transducer simulation utilizing dual pyroelectric crystal differential sensing
                  and Fresnel optical cone lenses to trigger automated alerts upon thermal human presence.
                </p>

                {/* Interactive Testing Field */}
                <div
                  onPointerMove={handlePirMove}
                  className={`mt-4 relative h-56 sm:h-64 w-full rounded-xl border transition-all duration-200 p-4 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden ${
                    isMotionTriggered
                      ? "border-vital-coral bg-rose-50/70"
                      : "border-clinical-grid bg-slate-50"
                  }`}
                >
                  {/* Radiating Animated Rings when Triggered */}
                  {isMotionTriggered && (
                    <>
                      <div className="pir-ring-active absolute h-32 w-32 rounded-full border-2 border-vital-coral/60 pointer-events-none" />
                      <div
                        className="pir-ring-active absolute h-48 w-48 rounded-full border-2 border-vital-coral/40 pointer-events-none"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </>
                  )}

                  {/* Central Sensor Cone Vector Graphic */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all ${
                        isMotionTriggered
                          ? "border-vital-coral bg-vital-coral text-white shadow-glow-vital scale-110"
                          : "border-surgical-teal bg-surgical-teal/10 text-surgical-teal"
                      }`}
                    >
                      <Radio className="h-8 w-8 animate-pulse" />
                    </div>

                    <div className="mt-3 font-mono text-xs font-bold">
                      {isMotionTriggered ? (
                        <span className="text-vital-coral flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5" />
                          THERMAL INTRUSION DETECTED // 3.3V HIGH
                        </span>
                      ) : (
                        <span className="text-surgical-teal">
                          HC-SR501 STANDBY // MOVE CURSOR HERE TO TRIGGER
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Counter & Timestamp Status */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-clinical-muted pt-2 border-t border-clinical-grid/60">
                    <span>DETECTION CYCLES: {triggerCount}</span>
                    <span>LAST TRIGGER: {lastTriggerTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs text-clinical-muted">
                <span>Hardware: HC-SR501 PIR Transducer</span>
                <span className="text-vital-coral font-bold">ACTIVE MONITORING</span>
              </div>
            </ClinicalCard>
          </div>

          {/* ======================================================== */}
          {/* BENTO CARD 4: MOVIE RECOMMENDATION (ML COSINE) - 6 COLS  */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex">
            <ClinicalCard
              cornerMarks
              calibrationRef="INTERNSHIP // YBI FOUNDATION ML"
              elevation="diagnostic"
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-surgical-teal flex items-center gap-1.5">
                    <Film className="h-4 w-4" />
                    Recommendation Engine (May–June 2024)
                  </span>
                  <span className="font-mono text-[10px] text-clinical-muted border border-clinical-grid rounded px-2 py-0.5">
                    YBI Foundation
                  </span>
                </div>

                <h3 className="text-xl font-bold text-clinical-ink leading-snug">
                  High-Dimensional Cosine Similarity Graph
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-clinical-muted leading-relaxed">
                  Constructed using Python, Pandas, and Scikit-Learn to compute multi-feature cosine vectors across
                  cast, director, genre tags, and overview matrices.
                </p>

                {/* Interactive 6-Node Graph Viewport */}
                <div className="mt-3 relative h-56 sm:h-64 w-full rounded-xl border border-clinical-grid bg-white p-2 overflow-hidden shadow-2xs">
                  {/* Graph Edge SVG Hairlines */}
                  <svg
                    viewBox="0 0 380 190"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    {movieNodes.map((source) =>
                      movieNodes.map((target) => {
                        if (source.id >= target.id) return null;
                        const isSelectedConnected =
                          (source.id === selectedMovieId &&
                            currentSimilarities.some((s) => s.targetId === target.id)) ||
                          (target.id === selectedMovieId &&
                            currentSimilarities.some((s) => s.targetId === source.id));

                        return (
                          <line
                            key={`${source.id}-${target.id}`}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={isSelectedConnected ? "#0D9488" : "#E2E8F0"}
                            strokeWidth={isSelectedConnected ? 2 : 1}
                            strokeDasharray={isSelectedConnected ? "none" : "3 3"}
                          />
                        );
                      })
                    )}
                  </svg>

                  {/* 6 Clickable Movie Nodes */}
                  {movieNodes.map((node) => {
                    const isSelected = selectedMovieId === node.id;
                    const simMatch = currentSimilarities.find((s) => s.targetId === node.id);

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedMovieId(node.id)}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold transition-all cursor-pointer shadow-2xs ${
                          isSelected
                            ? "bg-surgical-teal text-white ring-4 ring-surgical-teal/20 scale-105 z-20"
                            : simMatch
                            ? "bg-teal-50 border border-surgical-teal text-surgical-teal z-10"
                            : "bg-white border border-clinical-grid text-clinical-muted hover:text-clinical-ink"
                        }`}
                      >
                        <div>{node.title}</div>
                        {simMatch && (
                          <div className="text-[8px] text-surgical-teal/90">
                            cos: {simMatch.score}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Similarity Readout */}
                <div className="mt-3 rounded-lg bg-slate-50 border border-clinical-grid p-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-clinical-ink font-bold mb-1">
                    <span>SELECTED: {activeMovieObj?.title}</span>
                    <span className="text-surgical-teal text-[11px]">
                      TOP MATCH: {currentSimilarities[0]?.target} ({currentSimilarities[0]?.score})
                    </span>
                  </div>
                  <p className="text-[11px] text-clinical-muted leading-tight">
                    Rationale: {currentSimilarities[0]?.rationale}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs text-clinical-muted">
                <span>Tech: Scikit-Learn, Pandas, NumPy</span>
                <span className="text-surgical-teal font-bold">ALGORITHM VERIFIED</span>
              </div>
            </ClinicalCard>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveLab;
