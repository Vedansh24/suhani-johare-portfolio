"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalCard } from "@/components/ui/ClinicalCard";
import type { EducationItem, WorkshopAchievement, PersonalInfo } from "@/data/resume";
import {
  GraduationCap,
  Wrench,
  Heart,
  Medal,
  Calendar,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface EducationAchievementsProps {
  education: EducationItem[];
  workshopsAchievements: WorkshopAchievement;
  personal: PersonalInfo;
}

export function EducationAchievements({
  education,
  workshopsAchievements,
  personal,
}: EducationAchievementsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".edu-card-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
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

  const sgsits = education.find((e) => e.id === "edu-sgsits");
  const school12 = education.find((e) => e.id === "edu-holycross-12");
  const school10 = education.find((e) => e.id === "edu-holycross-10");

  return (
    <section
      id="education"
      ref={containerRef}
      className="py-24 border-b border-clinical-grid bg-blueprint-grid relative"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <ClinicalBadge variant="teal" size="sm">
              MODULE 06 // FOUNDATIONS
            </ClinicalBadge>
            <span className="font-mono text-xs text-clinical-muted">
              ACADEMIC BLUEPRINT & CREDENTIALS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-ink tracking-tight">
            Education, Workshops & Off-Duty Profile
          </h2>
          <p className="mt-2 text-sm sm:text-base text-clinical-muted leading-relaxed font-sans">
            Formal Biomedical Engineering degree from SGSITS Indore, school foundations,
            manufacturer workshop training, athletic medals, and personal profile.
          </p>
        </div>

        {/* 2-Column Academic Grid + Bottom Bento Row */}
        <div className="space-y-8">
          {/* Top Row: Academic Foundations (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SGSITS Major Degree (7 cols) */}
            <div className="lg:col-span-7 edu-card-reveal">
              <ClinicalCard
                cornerMarks
                calibrationRef="UNDERGRADUATE DEGREE // AICTE ACCREDITED"
                elevation="diagnostic"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-clinical-grid pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-surgical-teal" />
                      <span className="font-mono text-xs font-bold text-surgical-teal">
                        ENGINEERING DEGREE
                      </span>
                    </div>
                    <span className="font-mono text-xs text-clinical-muted flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {sgsits?.period || "Graduated 2025"}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-clinical-ink leading-snug">
                    {sgsits?.degree || "B.Tech in Biomedical Engineering"}
                  </h3>
                  <p className="text-sm font-semibold text-clinical-muted mt-1">
                    {sgsits?.institution}
                  </p>
                  <p className="font-mono text-xs text-surgical-teal mt-0.5">
                    Indore, Madhya Pradesh, India
                  </p>

                  <div className="my-5 rounded-xl border border-clinical-grid bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-2xs">
                    <div>
                      <span className="text-clinical-muted text-[10px] block">ACADEMIC SCORE:</span>
                      <span className="text-2xl font-extrabold text-clinical-ink">
                        {sgsits?.score || "CGPA: 6.67"}
                      </span>
                    </div>
                    <div className="border-l border-clinical-grid pl-4">
                      <span className="text-clinical-muted text-[10px] block">MAJOR:</span>
                      <span className="text-surgical-teal font-bold">Biomedical Engineering</span>
                    </div>
                    <div className="border-l border-clinical-grid pl-4">
                      <span className="text-clinical-muted text-[10px] block">AFFILIATION:</span>
                      <span className="text-clinical-ink font-semibold">Autonomous SGSITS (Est. 1952)</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-clinical-muted leading-relaxed">
                    {sgsits?.notes ||
                      "Focus on Biomedical Instrumentation, Medical Image Processing, Physiological Signal Conditioning, and Hospital Healthcare Equipment Operations."}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs text-clinical-muted">
                  <span>Department of Biomedical Engineering</span>
                  <span className="text-surgical-teal font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    B.TECH CONFERRED
                  </span>
                </div>
              </ClinicalCard>
            </div>

            {/* Holy Cross School Foundations (5 cols) */}
            <div className="lg:col-span-5 edu-card-reveal">
              <ClinicalCard
                cornerMarks
                calibrationRef="SECONDARY EDUCATION // CBSE BOARD"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-clinical-grid pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-medical-cobalt" />
                      <span className="font-mono text-xs font-bold text-medical-cobalt">
                        SCHOOL FOUNDATIONS
                      </span>
                    </div>
                    <span className="font-mono text-xs text-clinical-muted">
                      2019 – 2021
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-clinical-ink">
                    Holy Cross Convent School, Indore
                  </h3>
                  <p className="font-mono text-xs text-clinical-muted mt-0.5">
                    Central Board of Secondary Education (CBSE)
                  </p>

                  <div className="mt-5 space-y-3 font-mono text-xs">
                    {/* 12th CBSE */}
                    <div className="rounded-xl border border-clinical-grid p-3.5 bg-slate-50 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-clinical-ink">
                          {school12?.degree || "12th CBSE (Senior Secondary)"}
                        </span>
                        <span className="font-extrabold text-medical-cobalt text-base">
                          {school12?.score || "73%"}
                        </span>
                      </div>
                      <span className="text-clinical-muted text-[11px] mt-0.5 block">
                        Completed in {school12?.period || "2021"} · Indore, MP
                      </span>
                    </div>

                    {/* 10th CBSE */}
                    <div className="rounded-xl border border-clinical-grid p-3.5 bg-slate-50 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-clinical-ink">
                          {school10?.degree || "10th CBSE (Secondary Exam)"}
                        </span>
                        <span className="font-extrabold text-medical-cobalt text-base">
                          {school10?.score || "71.2%"}
                        </span>
                      </div>
                      <span className="text-clinical-muted text-[11px] mt-0.5 block">
                        Completed in {school10?.period || "2019"} · Indore, MP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-clinical-grid text-xs font-mono text-clinical-muted flex justify-between">
                  <span>Science Stream (PCM)</span>
                  <span className="text-medical-cobalt font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    VERIFIED CBSE
                  </span>
                </div>
              </ClinicalCard>
            </div>
          </div>

          {/* Bottom Row: 3 Bento Cards (Workshop Training, Sports Honors, Personal Profile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workshop: B. Braun */}
            <div className="edu-card-reveal">
              <ClinicalCard
                cornerMarks
                calibrationRef="MANUFACTURER WORKSHOP"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-surgical-teal mb-3 font-mono text-xs font-bold">
                    <Wrench className="h-4 w-4" />
                    <span>CERTIFIED PM TRAINING</span>
                  </div>

                  <h4 className="text-base font-bold text-clinical-ink">
                    {workshopsAchievements.workshops[0]?.title || "Care & Maintenance Workshop"}
                  </h4>
                  <p className="font-mono text-xs text-clinical-muted mt-1">
                    {workshopsAchievements.workshops[0]?.organization || "B. Braun Medical (India) Pvt. Ltd."}
                  </p>
                  <p className="mt-3 text-xs text-clinical-muted leading-relaxed">
                    Intensive clinical engineering workshop on technical handling, preventive maintenance protocols,
                    and device safety for hospital medical equipment.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs">
                  <span className="text-clinical-muted">Completed: {workshopsAchievements.workshops[0]?.period || "June 2023"}</span>
                  <span className="text-surgical-teal font-bold">B. BRAUN INDIA</span>
                </div>
              </ClinicalCard>
            </div>

            {/* Athletic & Sports Achievements */}
            <div className="edu-card-reveal">
              <ClinicalCard
                cornerMarks
                calibrationRef="ATHLETIC HONORS"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-vital-coral mb-3 font-mono text-xs font-bold">
                    <Medal className="h-4 w-4" />
                    <span>TRACK & SPORTS HONORS</span>
                  </div>

                  <h4 className="text-base font-bold text-clinical-ink">
                    Medals in Inter-School & College Sports
                  </h4>
                  <p className="font-mono text-xs text-clinical-muted mt-1">
                    Athletics & Competitive Tournaments
                  </p>

                  <div className="mt-3 space-y-2 text-xs text-clinical-muted leading-relaxed">
                    {workshopsAchievements.sports.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-vital-coral font-bold">•</span>
                        <span>
                          {item.title} ({item.year})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs">
                  <span className="text-clinical-muted">Endurance & Team Play</span>
                  <span className="text-vital-coral font-bold">MEDALIST</span>
                </div>
              </ClinicalCard>
            </div>

            {/* Personal Details & Interests */}
            <div className="edu-card-reveal">
              <ClinicalCard
                cornerMarks
                calibrationRef="OFF-DUTY PROFILE"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-medical-cobalt mb-3 font-mono text-xs font-bold">
                    <Heart className="h-4 w-4" />
                    <span>PERSONAL PROFILE & HOBBIES</span>
                  </div>

                  <h4 className="text-base font-bold text-clinical-ink">
                    Off-Duty Interests & Communication
                  </h4>
                  <p className="font-mono text-xs text-clinical-muted mt-1">
                    Indore, Madhya Pradesh, India
                  </p>

                  <div className="mt-3 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-clinical-grid/60">
                      <span className="text-clinical-muted">Languages:</span>
                      <span className="font-semibold text-clinical-ink">
                        {personal.languages.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-clinical-grid/60">
                      <span className="text-clinical-muted">Interests:</span>
                      <span className="font-semibold text-clinical-ink">
                        {personal.hobbies.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-clinical-muted">Affiliation:</span>
                      <span className="font-semibold text-surgical-teal">
                        Vishesh Jupiter Hospital
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-clinical-grid flex items-center justify-between font-mono text-xs">
                  <span className="text-clinical-muted">DOB: {personal.dob}</span>
                  <span className="text-medical-cobalt font-bold">ACTIVE ENGINEER</span>
                </div>
              </ClinicalCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EducationAchievements;
