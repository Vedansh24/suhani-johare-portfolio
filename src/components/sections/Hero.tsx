"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalButton } from "@/components/ui/ClinicalButton";
import { PatientMonitor } from "./PatientMonitor";
import type { PersonalInfo } from "@/data/resume";
import { ArrowDown, Cpu, Mail, MapPin, GraduationCap, Building2 } from "lucide-react";

interface HeroProps {
  personal: PersonalInfo;
}

export function Hero({ personal }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Background subtle 60fps ECG grid canvas with moving coral pulse head
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let animId: number;
    let isVisible = true;
    let phase = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Subtle architectural blueprint grid lines (28px)
      ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
      ctx.lineWidth = 0.5;
      const step = 28;

      ctx.beginPath();
      for (let x = 0; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Physiological ECG wave sweeping along bottom third
      ctx.strokeStyle = "rgba(13, 148, 136, 0.16)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();

      const waveY = h * 0.78;
      const period = 260;
      let peakX = 0;
      let peakY = waveY;

      for (let x = 0; x < w; x += 3) {
        const phi = ((x - phase) % period + period) % period / period;
        let dy = 0;

        if (phi > 0.35 && phi < 0.40) {
          dy = -Math.sin(((phi - 0.35) / 0.05) * Math.PI) * 28;
          if (dy < -20) {
            peakX = x;
            peakY = waveY + dy;
          }
        } else if (phi > 0.40 && phi < 0.44) {
          dy = Math.sin(((phi - 0.40) / 0.04) * Math.PI) * 10;
        } else if (phi > 0.55 && phi < 0.68) {
          dy = -Math.sin(((phi - 0.55) / 0.13) * Math.PI) * 8;
        }

        const y = waveY + dy;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Moving coral pulse dot at R-peak
      if (peakX > 0) {
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.arc(peakX, peakY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      phase += 0.9;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Staggered GSAP Entrance Animation
  useGSAP(
    () => {
      gsap.from(".hero-anim-item", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: containerRef }
  );

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[92vh] overflow-hidden border-b border-clinical-grid bg-clinical-bg py-12 lg:py-20 flex items-center"
    >
      {/* Background Subtle ECG Grid Canvas */}
      <canvas
        ref={bgCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Blueprint */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Clinical Hospital Badge */}
            <div className="hero-anim-item flex flex-wrap items-center gap-2">
              <ClinicalBadge variant="teal" pulse size="sm">
                BIOMEDICAL ENGINEER // VISHESH JUPITER HOSPITAL
              </ClinicalBadge>
              <span className="font-mono text-xs text-clinical-muted flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-surgical-teal" />
                {personal.location}
              </span>
            </div>

            {/* Headline */}
            <div className="hero-anim-item space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-clinical-ink leading-[1.08]">
                Suhani Johare
              </h1>
              <div className="flex flex-wrap items-center gap-2 font-mono text-sm sm:text-base font-semibold text-surgical-teal">
                <span className="rounded bg-surgical-teal/10 border border-surgical-teal/30 px-2.5 py-0.5 text-surgical-teal">
                  B.TECH BIOMEDICAL (SGSITS)
                </span>
                <span className="text-clinical-muted">·</span>
                <span className="text-clinical-ink font-medium">
                  PYTHON • MATLAB • AI/ML
                </span>
              </div>
            </div>

            {/* Verified Summary */}
            <p className="hero-anim-item text-base sm:text-lg text-clinical-muted leading-relaxed max-w-xl">
              {personal.summary}
            </p>

            {/* Key Spec Micro-Cards */}
            <div className="hero-anim-item grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="clinical-card rounded-xl border border-clinical-grid p-3 shadow-clinical">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-clinical-ink">
                  <GraduationCap className="h-4 w-4 text-surgical-teal" />
                  <span>B.Tech BME · SGSITS</span>
                </div>
                <div className="text-[10px] text-clinical-muted mt-1 font-mono">
                  Indore · 6.67 CGPA (2025)
                </div>
              </div>

              <div className="clinical-card rounded-xl border border-clinical-grid p-3 shadow-clinical">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-clinical-ink">
                  <Building2 className="h-4 w-4 text-medical-cobalt" />
                  <span>Hospital MedTech</span>
                </div>
                <div className="text-[10px] text-clinical-muted mt-1 font-mono">
                  Vishesh Jupiter Hospital
                </div>
              </div>

              <div className="clinical-card rounded-xl border border-clinical-grid p-3 shadow-clinical">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-clinical-ink">
                  <Cpu className="h-4 w-4 text-vital-coral" />
                  <span>Python & MATLAB</span>
                </div>
                <div className="text-[10px] text-clinical-muted mt-1 font-mono">
                  Image Processing & ML
                </div>
              </div>
            </div>

            {/* Tactile CTAs */}
            <div className="hero-anim-item flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#equipment-lab"
                onClick={(e) => handleScrollTo(e, "equipment-lab")}
              >
                <ClinicalButton variant="primary" size="lg" className="gap-2 shadow-clinical">
                  <Cpu className="h-4 w-4" />
                  <span>EXPLORE EQUIPMENT LAB</span>
                  <ArrowDown className="h-4 w-4 opacity-70" />
                </ClinicalButton>
              </a>

              <a
                href="#contact"
                onClick={(e) => handleScrollTo(e, "contact")}
              >
                <ClinicalButton variant="outline" size="lg" className="gap-2">
                  <Mail className="h-4 w-4 text-surgical-teal" />
                  <span>CONNECT</span>
                </ClinicalButton>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Multiparameter Patient Monitor */}
          <div className="lg:col-span-6 w-full">
            <PatientMonitor />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
