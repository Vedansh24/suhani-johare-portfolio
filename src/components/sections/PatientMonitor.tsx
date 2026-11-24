"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Activity, ShieldCheck, Wrench, CheckCircle2, Clock } from "lucide-react";

export type MonitorMode = "sinus" | "calibration" | "diagnostic";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function PatientMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<MonitorMode>("sinus");
  const [timeString, setTimeString] = useState<string>("12:00:00");
  const isClient = useIsClient();

  // Hydration-safe live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString("en-GB", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Canvas waveform generator on pure white high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let phase = 0;

    // Pause rendering when off-screen for 60fps battery efficiency
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Render loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Pure Clinical White Canvas Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Light Clinical Grid Hairlines (20px grid)
      ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
      ctx.lineWidth = 0.6;
      const gridSize = 20;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Divide monitor vertically into 3 distinct diagnostic trace channels
      const channelHeight = height / 3;

      // CHANNEL 1: ECG Lead II (Top Channel)
      const ecgBaseline = channelHeight * 0.52;
      const ecgAmplitude = channelHeight * 0.38;

      ctx.strokeStyle = mode === "calibration" ? "#D97706" : "#0D9488"; // Surgical Teal
      ctx.lineWidth = 2.2;
      ctx.shadowColor = mode === "calibration" ? "rgba(217, 119, 6, 0.35)" : "rgba(13, 148, 136, 0.35)";
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const ecgPeriod = 160; // Pixels per heartbeat
      for (let x = 0; x < width; x += 1.5) {
        const phi = ((x - phase) % ecgPeriod + ecgPeriod) % ecgPeriod / ecgPeriod;
        let yOffset = 0;

        if (mode === "calibration") {
          // 1.0 mV square calibration pulse
          if (phi > 0.3 && phi < 0.6) {
            yOffset = -ecgAmplitude * 0.9;
          } else {
            yOffset = 0;
          }
        } else {
          // Normal Sinus Rhythm (P - Q - R - S - T)
          if (phi >= 0.12 && phi < 0.22) {
            yOffset = -Math.sin(((phi - 0.12) / 0.1) * Math.PI) * (ecgAmplitude * 0.18);
          } else if (phi >= 0.28 && phi < 0.31) {
            yOffset = Math.sin(((phi - 0.28) / 0.03) * Math.PI) * (ecgAmplitude * 0.15);
          } else if (phi >= 0.31 && phi < 0.36) {
            yOffset = -Math.sin(((phi - 0.31) / 0.05) * Math.PI) * (ecgAmplitude * 1.0);
          } else if (phi >= 0.36 && phi < 0.40) {
            yOffset = Math.sin(((phi - 0.36) / 0.04) * Math.PI) * (ecgAmplitude * 0.32);
          } else if (phi >= 0.52 && phi < 0.70) {
            yOffset = -Math.sin(((phi - 0.52) / 0.18) * Math.PI) * (ecgAmplitude * 0.28);
          }
        }

        const y = ecgBaseline + yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // CHANNEL 2: SpO2 Plethysmograph (Middle Channel)
      const plethBaseline = channelHeight + channelHeight * 0.6;
      const plethAmplitude = channelHeight * 0.34;

      ctx.strokeStyle = "#0284C7"; // Medical Cobalt
      ctx.shadowColor = "rgba(2, 132, 199, 0.35)";
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const plethPeriod = 160;
      for (let x = 0; x < width; x += 1.5) {
        const phi = ((x - phase) % plethPeriod + plethPeriod) % plethPeriod / plethPeriod;
        let yOffset = 0;

        if (mode === "calibration") {
          yOffset = Math.sin(phi * Math.PI * 2) * (plethAmplitude * 0.5);
        } else {
          // Systolic peak + dicrotic notch
          if (phi < 0.25) {
            yOffset = -Math.sin((phi / 0.25) * (Math.PI / 2)) * plethAmplitude;
          } else if (phi < 0.45) {
            const t = (phi - 0.25) / 0.2;
            yOffset = -plethAmplitude * (1 - t * 0.5 + Math.sin(t * Math.PI) * 0.15);
          } else {
            const t = (phi - 0.45) / 0.55;
            yOffset = -plethAmplitude * 0.5 * (1 - t);
          }
        }

        const y = plethBaseline + yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // CHANNEL 3: Respiration (Bottom Channel)
      const respBaseline = channelHeight * 2 + channelHeight * 0.52;
      const respAmplitude = channelHeight * 0.3;

      ctx.strokeStyle = "#475569"; // Clinical Slate
      ctx.shadowColor = "rgba(71, 85, 105, 0.25)";
      ctx.shadowBlur = 3;
      ctx.beginPath();

      const respPeriod = 380; // Slower respiration cycle
      for (let x = 0; x < width; x += 2) {
        const phi = ((x - phase * 0.6) % respPeriod + respPeriod) % respPeriod / respPeriod;
        const yOffset = -Math.sin(phi * Math.PI * 2) * respAmplitude;
        const y = respBaseline + yOffset;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Real-time Sweep Erase Head Bar (Medical Erase Gap)
      const sweepX = (phase * 1.6) % width;
      const sweepWidth = 28;

      const sweepGradient = ctx.createLinearGradient(sweepX, 0, sweepX + sweepWidth, 0);
      sweepGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      sweepGradient.addColorStop(0.7, "rgba(255, 255, 255, 0.9)");
      sweepGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = sweepGradient;
      ctx.fillRect(sweepX, 0, sweepWidth, height);

      // Channel Labels on Canvas
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#0D9488";
      ctx.fillText("ECG II  1mV/cm", 10, 16);

      ctx.fillStyle = "#0284C7";
      ctx.fillText("SpO2 PLETH", 10, channelHeight + 16);

      ctx.fillStyle = "#475569";
      ctx.fillText("RESP IMPEDANCE", 10, channelHeight * 2 + 16);

      // Diagnostic Scanline Overlay in Diagnostic Check mode
      if (mode === "diagnostic") {
        const diagX = (phase * 2.5) % width;
        ctx.fillStyle = "rgba(13, 148, 136, 0.08)";
        ctx.fillRect(diagX - 18, 0, 36, height);

        ctx.strokeStyle = "rgba(13, 148, 136, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(diagX, 0);
        ctx.lineTo(diagX, height);
        ctx.stroke();

        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#0D9488";
        ctx.fillText("DIAGNOSTIC SWEEP // IEC 60601-1 VERIFIED", width - 265, height - 10);
      }

      phase += 1.8;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="clinical-card corner-marks relative w-full rounded-2xl border border-clinical-grid bg-white p-4 sm:p-5 shadow-clinical-lg"
    >
      {/* Precision Medical Monitor Outer Chassis Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-clinical-grid font-mono text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-surgical-teal vital-ping" />
          <span className="font-extrabold text-clinical-ink tracking-tight">
            BIO-MON X7 // MULTIPARAMETER
          </span>
          <span className="hidden sm:inline text-clinical-muted">· BED 04 ICU</span>
        </div>

        <div className="flex items-center gap-3 text-clinical-muted text-[11px]">
          <div className="flex items-center gap-1.5 text-clinical-ink font-semibold bg-clinical-bg border border-clinical-grid px-2 py-0.5 rounded">
            <Clock className="h-3 w-3 text-surgical-teal" />
            <span>{isClient ? timeString : "12:00:00"}</span>
          </div>

          <span className="rounded bg-clinical-grid/60 px-2 py-0.5 text-clinical-ink font-semibold">
            {mode === "sinus"
              ? "NORMAL SINUS"
              : mode === "calibration"
              ? "CALIBRATION 1mV"
              : "DIAGNOSTIC SCAN"}
          </span>
        </div>
      </div>

      {/* Screen Frame with Recessed Bezel & Bright White Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-xl border border-clinical-grid bg-slate-50/70 p-3">
        {/* Left Column: 3 Real-time Canvas Waveforms on Pure White Screen */}
        <div className="md:col-span-3 relative h-60 sm:h-72 w-full rounded-lg border border-clinical-grid/80 overflow-hidden shadow-2xs">
          <canvas
            ref={canvasRef}
            className="w-full h-full block monitor-grid-bg"
          />
        </div>

        {/* Right Column: High-Contrast Pastel Clinical Vitals Readouts */}
        <div className="md:col-span-1 flex flex-row md:flex-col justify-between gap-2.5 border-t md:border-t-0 md:border-l border-clinical-grid pt-2.5 md:pt-0 md:pl-3 font-mono">
          {/* Heart Rate */}
          <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50/80 p-2.5 text-left shadow-2xs">
            <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
              <span>HR (ECG)</span>
              <Activity className="h-3 w-3 animate-pulse text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 leading-tight mt-0.5">
              72
            </div>
            <div className="text-[9px] text-emerald-700 font-semibold">BPM · SINUS</div>
          </div>

          {/* SpO2 */}
          <div className="flex-1 rounded-lg border border-sky-200 bg-sky-50/80 p-2.5 text-left shadow-2xs">
            <div className="flex items-center justify-between text-[10px] text-sky-800 font-bold">
              <span>SpO2</span>
              <span className="text-[9px] text-sky-600">%</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 leading-tight mt-0.5">
              99
            </div>
            <div className="text-[9px] text-sky-700 font-semibold">PLETH NORMAL</div>
          </div>

          {/* Respiration Rate & NIBP */}
          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-100/90 p-2.5 text-left shadow-2xs">
            <div className="flex items-center justify-between text-[10px] text-slate-700 font-bold">
              <span>RESP / NIBP</span>
              <span className="text-[9px] text-amber-700 font-semibold">NOMINAL</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight mt-0.5">
              16 <span className="text-xs font-normal text-slate-600">/min</span>
            </div>
            <div className="text-[9px] text-slate-600 font-medium">120/80 (93) mmHg</div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Buttons */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-clinical-grid/70">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMode("sinus")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all cursor-pointer ${
              mode === "sinus"
                ? "bg-surgical-teal text-white shadow-2xs"
                : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            [NORMAL SINUS]
          </button>

          <button
            type="button"
            onClick={() => setMode("calibration")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all cursor-pointer ${
              mode === "calibration"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            [CALIBRATION MODE]
          </button>

          <button
            type="button"
            onClick={() => setMode("diagnostic")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all cursor-pointer ${
              mode === "diagnostic"
                ? "bg-medical-cobalt text-white shadow-2xs"
                : "bg-clinical-grid/60 text-clinical-muted hover:text-clinical-ink"
            }`}
          >
            [DIAGNOSTIC CHECK]
          </button>
        </div>

        {/* Live Status readout */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {mode === "sinus" && (
            <span className="text-surgical-teal flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              STATUS: NOMINAL // 72 BPM
            </span>
          )}
          {mode === "calibration" && (
            <span className="text-amber-700 flex items-center gap-1 font-semibold">
              <Wrench className="h-3.5 w-3.5" />
              1.0 mV CAL // PASS (±0.02mV)
            </span>
          )}
          {mode === "diagnostic" && (
            <span className="text-medical-cobalt flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              IEC 60601-1 SAFETY // VERIFIED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientMonitor;
