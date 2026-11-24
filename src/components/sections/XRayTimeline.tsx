"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalCard } from "@/components/ui/ClinicalCard";
import type { WorkExperienceItem, InternshipTrainingItem, WorkshopAchievement } from "@/data/resume";
import {
  Calendar,
  MapPin,
  Building2,
  Cpu,
  Wrench,
  CheckCircle2,
  Stethoscope,
  Scan,
} from "lucide-react";

interface XRayTimelineProps {
  workExperience: WorkExperienceItem[];
  trainings: InternshipTrainingItem[];
  workshops: WorkshopAchievement["workshops"];
}

interface TimelineEntry {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  category: "HOSPITAL APPOINTMENT" | "AI & ML INTERNSHIP" | "CLINICAL TRAINING" | "TECHNICAL WORKSHOP";
  badgeVariant: "teal" | "cobalt" | "coral" | "muted";
  icon: typeof Stethoscope;
  summary: string[];
  diagnosticTags: string[];
  underlayMeta: {
    protocol: string;
    focus: string;
    compliance: string;
  };
}

export function XRayTimeline({ workExperience, trainings, workshops }: XRayTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanBeamRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [scanDepthMm, setScanDepthMm] = useState(120);

  // Compile normalized chronological entries from locked-down resume data
  const currentWork = workExperience[0];
  const ybiInternship = trainings.find((t) => t.id === "intern-ybi");
  const hospitalTraining = trainings.find((t) => t.id === "training-vjh");
  const bbraunWorkshop = workshops[0];

  const entries: TimelineEntry[] = [
    {
      id: "entry-1",
      role: currentWork.role,
      organization: currentWork.organization,
      period: currentWork.period,
      location: currentWork.location,
      category: "HOSPITAL APPOINTMENT",
      badgeVariant: "teal",
      icon: Stethoscope,
      summary: currentWork.responsibilities,
      diagnosticTags: [
        "PREVENTIVE MAINTENANCE",
        "AMC/CMC COMPLIANCE",
        "ELECTRICAL SAFETY",
        "ICU LIFE-SUPPORT",
      ],
      underlayMeta: {
        protocol: "NABH / HOSPITAL QUALITY STANDARDS",
        focus: "Critical Care Diagnostics & Life-Support Equipment",
        compliance: "Scheduled PM, Calibration & Electrical Safety Inspection",
      },
    },
    {
      id: "entry-2",
      role: ybiInternship?.title || "AI & Machine Learning Intern",
      organization: ybiInternship?.organization || "YBI Foundation",
      period: ybiInternship?.period || "May – June 2024",
      location: "Remote / Project-Based",
      category: "AI & ML INTERNSHIP",
      badgeVariant: "cobalt",
      icon: Cpu,
      summary: [
        ybiInternship?.summary || "Developed Movie Recommendation System using Python, Pandas, and Scikit-Learn.",
        ...(ybiInternship?.highlights || []),
      ],
      diagnosticTags: [
        "SCIKIT-LEARN",
        "PANDAS & NUMPY",
        "COLLABORATIVE FILTERING",
        "PYTHON ML PIPELINES",
      ],
      underlayMeta: {
        protocol: "DATA SCIENCE & ML WORKFLOW",
        focus: "High-dimensional Matrix Factorization & Recommendation Logic",
        compliance: "User-Item Interaction Matrix & Scikit-Learn Optimization",
      },
    },
    {
      id: "entry-3",
      role: hospitalTraining?.title || "Hospital Biomedical Trainee",
      organization: hospitalTraining?.organization || "Vishesh Jupiter Hospital",
      period: hospitalTraining?.period || "June – July 2023",
      location: hospitalTraining?.location || "Indore, India",
      category: "CLINICAL TRAINING",
      badgeVariant: "teal",
      icon: Building2,
      summary: [
        hospitalTraining?.summary || "Assisted in Biomedical Department administration, service histories, and surgical operations.",
        ...(hospitalTraining?.highlights || []),
      ],
      diagnosticTags: [
        "SURGICAL OT OBSERVATION",
        "DEVICE CALIBRATION",
        "ADMINISTRATION & LOGS",
        "CLINICAL OPERATIONS",
      ],
      underlayMeta: {
        protocol: "HOSPITAL CLINICAL ROTATION",
        focus: "Biomedical Department Operations & OR Suite Support",
        compliance: "Medical Equipment Preventive Maintenance & Safety Inspection",
      },
    },
    {
      id: "entry-4",
      role: bbraunWorkshop.title,
      organization: bbraunWorkshop.organization,
      period: bbraunWorkshop.period,
      location: "B. Braun Training Center, India",
      category: "TECHNICAL WORKSHOP",
      badgeVariant: "coral",
      icon: Wrench,
      summary: [
        "Completed professional hands-on care, maintenance, and technical handling protocols for clinical infusion and medical device hardware.",
        "Gained deep understanding of manufacturer calibration standards and field breakdown prevention for medical equipment.",
      ],
      diagnosticTags: [
        "B. BRAUN HARDWARE",
        "INFUSION SYSTEM PM",
        "STERILIZATION & CARE",
        "DEVICE REPAIR PROTOCOL",
      ],
      underlayMeta: {
        protocol: "MANUFACTURER CERTIFIED PM",
        focus: "Precision Infusion Pumps & Critical Care Care Protocols",
        compliance: "B. Braun Quality & Preventive Maintenance Guidelines",
      },
    },
  ];

  useGSAP(
    () => {
      // 1. Scrubbed X-Ray Scanning Beam traversing the timeline vertical rail
      if (railRef.current && scanBeamRef.current) {
        gsap.fromTo(
          scanBeamRef.current,
          { y: 0, opacity: 0.7 },
          {
            y: () => railRef.current!.offsetHeight - 50,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: railRef.current,
              start: "top 55%",
              end: "bottom 75%",
              scrub: 0.8,
              onUpdate: (self) => {
                const mm = Math.round(120 + self.progress * 680);
                setScanDepthMm(mm);
              },
            },
          }
        );
      }

      // 2. Parallax background medical line-art props
      gsap.to(".parallax-caliper", {
        yPercent: -45,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".parallax-iv-chamber", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(".parallax-stethoscope", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.0,
        },
      });

      // 3. Staggered card reveals with active diagnostic underlay glow
      const cards = gsap.utils.toArray<HTMLElement>(".timeline-card");
      cards.forEach((card) => {
        gsap.from(card, {
          y: 35,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleClass: { targets: card, className: "xray-active" },
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative py-24 border-b border-clinical-grid bg-clinical-bg overflow-hidden blueprint-grid"
    >
      {/* 3 Background Medical Blueprint Parallax Line-Art Props */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        {/* Parallax Vernier Caliper (Right Margin) */}
        <div className="parallax-caliper absolute right-4 lg:right-16 top-1/4 opacity-15 w-64 h-64 text-surgical-teal">
          <svg viewBox="0 0 240 240" fill="none" className="w-full h-full stroke-current stroke-1">
            <rect x="20" y="30" width="200" height="24" rx="2" />
            <line x1="20" y1="54" x2="20" y2="120" strokeWidth="2" />
            <line x1="50" y1="54" x2="50" y2="90" />
            <line x1="80" y1="54" x2="80" y2="105" />
            <line x1="110" y1="54" x2="110" y2="90" />
            <line x1="140" y1="54" x2="140" y2="105" />
            <line x1="170" y1="54" x2="170" y2="90" />
            <line x1="200" y1="54" x2="200" y2="120" strokeWidth="2" />
            <circle cx="20" cy="42" r="3" fill="currentColor" />
            <text x="28" y="24" fontSize="8" fontFamily="monospace" fill="currentColor">
              CALIPER // VERIFICATION 0.02mm
            </text>
          </svg>
        </div>

        {/* Parallax Infusion Chamber (Left Margin) */}
        <div className="parallax-iv-chamber absolute left-2 lg:left-12 top-1/2 opacity-15 w-56 h-72 text-medical-cobalt">
          <svg viewBox="0 0 180 240" fill="none" className="w-full h-full stroke-current stroke-1">
            <path d="M 90 20 L 90 50 M 60 50 L 120 50 L 110 140 L 95 180 L 85 180 L 70 140 Z" />
            <line x1="75" y1="90" x2="105" y2="90" strokeDasharray="3 3" />
            <line x1="78" y1="110" x2="102" y2="110" strokeDasharray="3 3" />
            <path d="M 90 180 L 90 220" strokeWidth="2" />
            <circle cx="90" cy="195" r="2.5" fill="currentColor" />
            <text x="20" y="35" fontSize="8" fontFamily="monospace" fill="currentColor">
              INFUSION DRIP CHAMBER // B. BRAUN
            </text>
          </svg>
        </div>

        {/* Parallax Stethoscope & Diagnostic Transducer (Bottom Right Margin) */}
        <div className="parallax-stethoscope absolute right-6 lg:right-20 bottom-16 opacity-12 w-64 h-64 text-slate-400">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full stroke-current stroke-1">
            <circle cx="100" cy="100" r="36" />
            <circle cx="100" cy="100" r="24" strokeDasharray="4 4" />
            <path d="M 100 64 C 100 40 60 40 60 70 L 60 120" strokeWidth="1.5" />
            <path d="M 100 136 L 100 170" strokeWidth="2" />
            <circle cx="100" cy="100" r="6" fill="currentColor" />
            <text x="40" y="190" fontSize="8" fontFamily="monospace" fill="currentColor">
              TRANSDUCER ACOUSTIC BEAM
            </text>
          </svg>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="mb-14 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <ClinicalBadge variant="teal" size="sm">
              MODULE 03 // CLINICAL LOG
            </ClinicalBadge>
            <span className="font-mono text-xs text-clinical-muted">
              DIAGNOSTIC X-RAY CHRONOLOGY
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-ink tracking-tight">
            Diagnostic Experience & Technical Rotations
          </h2>
          <p className="mt-2 text-sm sm:text-base text-clinical-muted leading-relaxed font-sans">
            Verified chronology of hospital appointments, machine learning internships,
            and clinical equipment maintenance certifications.
          </p>
        </div>

        {/* Centered Alternating Timeline with Central Scanning Rail */}
        <div ref={railRef} className="relative">
          {/* Central Vertical Diagnostic Guideline */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 -translate-x-1/2 w-[2px] bg-clinical-grid" />

          {/* Traveling X-Ray Scanning Beam with Live Depth Readout */}
          <div
            ref={scanBeamRef}
            className="scanner-beam pointer-events-none absolute left-0 right-0 h-10 -translate-y-1/2 z-20 flex items-center justify-between px-4 sm:px-12 opacity-80"
          >
            <div className="flex items-center gap-1.5 rounded-full border border-surgical-teal/40 bg-white/95 px-2.5 py-0.5 font-mono text-[10px] text-surgical-teal font-bold shadow-2xs">
              <Scan className="h-3 w-3 animate-spin" />
              <span>X-RAY SCAN: {scanDepthMm} mm</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-medical-cobalt/40 bg-white/95 px-2.5 py-0.5 font-mono text-[10px] text-medical-cobalt font-bold shadow-2xs">
              <span>LEAD-II SYNC</span>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-12 sm:space-y-16">
            {entries.map((entry, index) => {
              const isEven = index % 2 === 0;
              const IconComp = entry.icon;

              return (
                <div
                  key={entry.id}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Central Timeline Milestone Node */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surgical-teal text-white shadow-clinical">
                    <IconComp className="h-4 w-4" />
                  </div>

                  {/* Empty Spacer Column for 50/50 alternating alignment */}
                  <div className="hidden sm:block sm:w-1/2" />

                  {/* Milestone Card Container */}
                  <div
                    className={`w-full sm:w-1/2 pl-14 sm:pl-0 ${
                      isEven ? "sm:pr-10" : "sm:pl-10"
                    }`}
                  >
                    <ClinicalCard
                      cornerMarks
                      calibrationRef={`${entry.category} // 0${index + 1}`}
                      elevation="diagnostic"
                      className="timeline-card p-6 border-l-4 border-l-surgical-teal"
                    >
                      {/* Period & Category Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <ClinicalBadge
                          variant={entry.badgeVariant}
                          size="sm"
                        >
                          {entry.category}
                        </ClinicalBadge>
                        <span className="flex items-center gap-1 font-mono text-xs text-clinical-muted">
                          <Calendar className="h-3.5 w-3.5 text-surgical-teal" />
                          {entry.period}
                        </span>
                      </div>

                      {/* Role & Organization Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-clinical-ink leading-snug">
                        {entry.role}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-surgical-teal font-semibold">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {entry.organization}
                        </span>
                        <span className="text-clinical-muted">·</span>
                        <span className="text-clinical-muted flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-clinical-muted" />
                          {entry.location}
                        </span>
                      </div>

                      {/* Verified Responsibilities Bullet Points */}
                      <ul className="mt-4 space-y-2 text-xs sm:text-sm text-clinical-muted leading-relaxed font-sans">
                        {entry.summary.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-surgical-teal shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Diagnostic Underlay Spec Bar with #TAGs */}
                      <div className="mt-5 pt-3 border-t border-clinical-grid/80 font-mono">
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {entry.diagnosticTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-clinical-bg border border-clinical-grid px-2 py-0.5 text-[10px] text-clinical-ink font-semibold"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="rounded-lg bg-slate-50 border border-clinical-grid p-2.5 text-[10px] text-clinical-muted space-y-0.5">
                          <div>
                            <span className="font-bold text-clinical-ink">PROTOCOL: </span>
                            <span>{entry.underlayMeta.protocol}</span>
                          </div>
                          <div>
                            <span className="font-bold text-clinical-ink">COMPLIANCE: </span>
                            <span className="text-surgical-teal font-semibold">
                              {entry.underlayMeta.compliance}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ClinicalCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default XRayTimeline;
