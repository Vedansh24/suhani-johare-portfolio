"use client";

import { useState, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalCard } from "@/components/ui/ClinicalCard";
import type { TechnicalSkills } from "@/data/resume";
import {
  Building2,
  Terminal,
  Globe2,
  ShieldCheck,
} from "lucide-react";

interface SkillsMatrixProps {
  skills?: TechnicalSkills;
}

interface SkillItem {
  name: string;
  level: number; // Percentage 0 - 100
  tier: string;
  context: string;
}

export function SkillsMatrix({}: SkillsMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem>({
    name: "Preventive Maintenance",
    level: 95,
    tier: "HOSPITAL APPLIED",
    context:
      "Scheduled PM, calibration, and electrical safety inspections across diagnostic, monitoring, and life-support medical equipment at Vishesh Jupiter Hospital.",
  });

  const column1: SkillItem[] = [
    {
      name: "Preventive Maintenance",
      level: 95,
      tier: "HOSPITAL APPLIED",
      context: "Scheduled PM, calibration, and electrical safety inspections across diagnostic and life-support devices at Vishesh Jupiter Hospital.",
    },
    {
      name: "Calibration (Basic Exposure)",
      level: 88,
      tier: "PRACTICAL EXPOSURE",
      context: "Hands-on calibration zeroing, multi-parameter monitor checks, and infusion pump accuracy verification at Vishesh Jupiter Hospital & B. Braun Workshop.",
    },
    {
      name: "Biomedical Instrumentation",
      level: 92,
      tier: "ADVANCED ACADEMIC",
      context: "Core degree practicals covering physiological transducers, bioamplifiers, optical sensors, and diagnostic medical electrical equipment.",
    },
    {
      name: "Medical Image Processing",
      level: 85,
      tier: "ADVANCED ACADEMIC",
      context: "850nm NIR subcutaneous vein visualization algorithms using MATLAB, adaptive thresholding, and morphological filtering.",
    },
    {
      name: "Electrical Safety Inspections",
      level: 90,
      tier: "HOSPITAL APPLIED",
      context: "Chassis grounding resistance (<0.1Ω), patient leakage currents, and earth continuity under hospital clinical quality guidelines.",
    },
    {
      name: "Equipment Inventory & AMC/CMC",
      level: 88,
      tier: "HOSPITAL APPLIED",
      context: "Medical equipment master asset register maintenance, breakdown logs, warranty tracking, and AMC/CMC service records.",
    },
  ];

  const column2: SkillItem[] = [
    {
      name: "Python",
      level: 90,
      tier: "CORE WORKFLOW",
      context: "Core language for machine learning recommendation systems, data manipulation, and web application backend APIs.",
    },
    {
      name: "MATLAB",
      level: 85,
      tier: "ADVANCED ACADEMIC",
      context: "Medical image processing algorithms, biosignal simulations, filter design, and numerical data visualization.",
    },
    {
      name: "Scikit-Learn",
      level: 86,
      tier: "CORE WORKFLOW",
      context: "High-dimensional feature vector extraction, cosine similarity metrics, and recommendation engine algorithms.",
    },
    {
      name: "Pandas & NumPy",
      level: 88,
      tier: "CORE WORKFLOW",
      context: "Real-world dataset cleaning, matrix transformations, and structured data manipulation pipelines.",
    },
    {
      name: "Git & Version Control",
      level: 82,
      tier: "CORE WORKFLOW",
      context: "Source code repository versioning, branching, commits, and collaborative software engineering on GitHub.",
    },
    {
      name: "Web Basics (HTML/CSS/JS/Django)",
      level: 84,
      tier: "CORE WORKFLOW",
      context: "Django web framework, role-based hospital portals, and frontend interface development for emergency telemetry.",
    },
  ];

  const column3: SkillItem[] = [
    {
      name: "Hospital Workflows & OT Protocols",
      level: 92,
      tier: "HOSPITAL APPLIED",
      context: "Operating room observation, surgical equipment support, sterile protocols, and nursing staff coordination.",
    },
    {
      name: "Technical Documentation & NABH",
      level: 90,
      tier: "HOSPITAL APPLIED",
      context: "Hospital quality standards, biomedical equipment service history logging, and statutory audit readiness.",
    },
    {
      name: "Vendor & Clinical Coordination",
      level: 88,
      tier: "HOSPITAL APPLIED",
      context: "Coordinating with manufacturer service engineers for installations, repairs, and technical staff guidance.",
    },
    {
      name: "Windows OS & Lab Workstations",
      level: 94,
      tier: "CORE PLATFORM",
      context: "Operating system environment for clinical diagnostic software, equipment test utilities, and development IDEs.",
    },
    {
      name: "English (Professional Working)",
      level: 95,
      tier: "FLUENT",
      context: "Professional technical reporting, hospital documentation, equipment manuals, and oral communication.",
    },
    {
      name: "Hindi (Native / Full Working)",
      level: 100,
      tier: "NATIVE",
      context: "Native communication with clinical staff, nursing teams, hospital patients, and local service providers.",
    },
  ];

  useGSAP(
    () => {
      // Animate progress fill bars
      gsap.from(".skill-fill-bar", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 78%",
          once: true,
        },
      });

      // Animate circular radial gauges
      gsap.from(".gauge-circle", {
        strokeDashoffset: 283,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 78%",
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="skills"
      ref={containerRef}
      className="py-24 border-b border-clinical-grid bg-clinical-bg blueprint-grid"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <ClinicalBadge variant="teal" size="sm">
              MODULE 05 // CALIBRATION BENCH
            </ClinicalBadge>
            <span className="font-mono text-xs text-clinical-muted">
              PRACTICAL & CLINICAL COMPETENCIES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-ink tracking-tight">
            Skills Matrix & Calibration Bench
          </h2>
          <p className="mt-2 text-sm sm:text-base text-clinical-muted leading-relaxed font-sans">
            Grounded, verified competencies across hospital engineering, medical equipment maintenance,
            and computation. Select any skill to inspect real-world hospital and academic applications.
          </p>
        </div>

        {/* 3-Column Skills Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Column 1: Biomedical Core & MedTech */}
          <ClinicalCard
            cornerMarks
            calibrationRef="BENCH 01 // BIOMEDICAL CORE"
            elevation="diagnostic"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-clinical-grid">
                <Building2 className="h-4 w-4 text-surgical-teal" />
                <h3 className="text-base font-bold text-clinical-ink">
                  Biomedical & MedTech
                </h3>
              </div>

              <div className="space-y-4">
                {column1.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedSkill(item)}
                    className="cursor-pointer group"
                  >
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                      <span className="font-semibold text-clinical-ink group-hover:text-surgical-teal transition-colors">
                        {item.name}
                      </span>
                      <span className="text-surgical-teal font-bold">{item.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-clinical-grid rounded-full overflow-hidden">
                      <div
                        className="skill-fill-bar h-full bg-gradient-to-r from-surgical-teal to-teal-400 rounded-full"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ClinicalCard>

          {/* Column 2: Programming & Computation */}
          <ClinicalCard
            cornerMarks
            calibrationRef="BENCH 02 // PROGRAMMING & ML"
            elevation="diagnostic"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-clinical-grid">
                <Terminal className="h-4 w-4 text-medical-cobalt" />
                <h3 className="text-base font-bold text-clinical-ink">
                  Programming & AI/ML
                </h3>
              </div>

              <div className="space-y-4">
                {column2.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedSkill(item)}
                    className="cursor-pointer group"
                  >
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                      <span className="font-semibold text-clinical-ink group-hover:text-medical-cobalt transition-colors">
                        {item.name}
                      </span>
                      <span className="text-medical-cobalt font-bold">{item.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-clinical-grid rounded-full overflow-hidden">
                      <div
                        className="skill-fill-bar h-full bg-gradient-to-r from-medical-cobalt to-sky-400 rounded-full"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ClinicalCard>

          {/* Column 3: Operational Systems & Languages */}
          <ClinicalCard
            cornerMarks
            calibrationRef="BENCH 03 // SYSTEMS & LANGUAGES"
            elevation="diagnostic"
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-clinical-grid">
                <Globe2 className="h-4 w-4 text-vital-coral" />
                <h3 className="text-base font-bold text-clinical-ink">
                  Operations & Languages
                </h3>
              </div>

              <div className="space-y-4">
                {column3.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedSkill(item)}
                    className="cursor-pointer group"
                  >
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                      <span className="font-semibold text-clinical-ink group-hover:text-vital-coral transition-colors">
                        {item.name}
                      </span>
                      <span className="text-clinical-muted font-bold">{item.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-clinical-grid rounded-full overflow-hidden">
                      <div
                        className="skill-fill-bar h-full bg-gradient-to-r from-slate-600 to-slate-400 rounded-full"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ClinicalCard>
        </div>

        {/* Selected Skill Inspection Panel + 3 Circular Radial Gauges */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Inspection Box (7 cols) */}
          <div className="lg:col-span-7">
            <div className="clinical-card rounded-2xl border border-clinical-grid p-5 shadow-clinical flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-clinical-grid font-mono text-xs">
                  <span className="text-clinical-muted uppercase">ACTIVE BENCH INSPECTION:</span>
                  <span className="rounded bg-surgical-teal/10 border border-surgical-teal/30 px-2.5 py-0.5 text-surgical-teal font-bold">
                    {selectedSkill.tier}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-clinical-ink">
                  {selectedSkill.name}
                </h4>
                <p className="mt-2 text-sm text-clinical-muted leading-relaxed">
                  {selectedSkill.context}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs">
                <span className="text-clinical-muted">CALIBRATION SCORE:</span>
                <span className="text-surgical-teal font-extrabold text-sm">
                  {selectedSkill.level} / 100 NOMINAL
                </span>
              </div>
            </div>
          </div>

          {/* Right 3 Circular Radial Gauges (5 cols) */}
          <div className="lg:col-span-5">
            <div className="clinical-card rounded-2xl border border-clinical-grid p-5 shadow-clinical flex flex-col justify-between h-full">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-clinical-grid font-mono text-xs">
                <span className="text-clinical-muted uppercase">READINESS GAUGES:</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  CLINICAL READINESS // PASS
                </span>
              </div>

              {/* 3 Circular SVG Radial Gauges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Gauge 1: Clinical Safety */}
                <div className="flex flex-col items-center">
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-clinical-grid"
                        strokeWidth="7"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="gauge-circle stroke-surgical-teal"
                        strokeWidth="7"
                        strokeDasharray="264"
                        strokeDashoffset="13" // ~95%
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute font-mono text-xs font-extrabold text-clinical-ink">
                      95%
                    </span>
                  </div>
                  <span className="mt-1 font-mono text-[10px] font-bold text-clinical-muted">
                    HOSPITAL PM
                  </span>
                </div>

                {/* Gauge 2: MedTech & ML */}
                <div className="flex flex-col items-center">
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-clinical-grid"
                        strokeWidth="7"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="gauge-circle stroke-medical-cobalt"
                        strokeWidth="7"
                        strokeDasharray="264"
                        strokeDashoffset="26" // ~90%
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute font-mono text-xs font-extrabold text-clinical-ink">
                      90%
                    </span>
                  </div>
                  <span className="mt-1 font-mono text-[10px] font-bold text-clinical-muted">
                    PYTHON/ML
                  </span>
                </div>

                {/* Gauge 3: Compliance & OS */}
                <div className="flex flex-col items-center">
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-clinical-grid"
                        strokeWidth="7"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="gauge-circle stroke-slate-700"
                        strokeWidth="7"
                        strokeDasharray="264"
                        strokeDashoffset="5" // ~98%
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute font-mono text-xs font-extrabold text-clinical-ink">
                      98%
                    </span>
                  </div>
                  <span className="mt-1 font-mono text-[10px] font-bold text-clinical-muted">
                    NABH/IEC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SkillsMatrix;
