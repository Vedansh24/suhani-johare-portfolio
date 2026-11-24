"use client";

import { useState } from "react";
import { ClinicalBadge } from "@/components/ui/ClinicalBadge";
import { ClinicalButton } from "@/components/ui/ClinicalButton";
import type { PersonalInfo } from "@/data/resume";
import {
  Mail,
  Phone,
  Send,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Copy,
  CheckCircle2,
} from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.76.78 1.76 1.75-.79 1.76-1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface ContactConsoleProps {
  personal: PersonalInfo;
}

export function ContactConsole({ personal }: ContactConsoleProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    org: "",
    topic: "Biomedical Equipment R&D / Hospital Engineering",
    message: "",
  });
  const [isSent, setIsSent] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setToastMessage(`COPIED TO CLIPBOARD // ${label.toUpperCase()}: ${text}`);
    setTimeout(() => {
      setCopiedField(null);
      setToastMessage(null);
    }, 2800);
  };

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${personal.email}?subject=${encodeURIComponent(
      `[Clinical Inquiry] ${formData.topic} - ${formData.name || "Inquirer"}`
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nOrganization: ${formData.org}\nTopic: ${formData.topic}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
    setIsSent(true);
    setTimeout(() => setIsSent(false), 4000);
  };

  return (
    <section id="contact" className="py-24 bg-clinical-bg border-b border-clinical-grid blueprint-grid relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <ClinicalBadge variant="teal" size="sm">
              MODULE 07 // CLINICAL UPLINK
            </ClinicalBadge>
            <span className="font-mono text-xs text-clinical-muted">
              DIRECT PROFESSIONAL CONTACT CONSOLE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-ink tracking-tight">
            Contact Console & Clinical Consultation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-clinical-muted leading-relaxed font-sans">
            Direct communication channel for Biomedical Engineering roles, clinical instrumentation
            initiatives, hospital equipment maintenance consultation, and collaborative MedTech projects.
          </p>
        </div>

        {/* Master Console Chassis (rounded-[32px] White Card with Gradient Top Bar) */}
        <div className="rounded-[32px] border border-clinical-grid bg-white p-6 sm:p-10 shadow-clinical-lg overflow-hidden relative">
          {/* Top Teal-Sky-Teal Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-surgical-teal via-medical-cobalt to-surgical-teal" />

          {/* Top Header Pill & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-clinical-grid font-mono text-xs">
            <div className="inline-flex items-center gap-2 rounded-full border border-surgical-teal/30 bg-surgical-teal/10 px-3.5 py-1 text-surgical-teal font-semibold">
              <span className="h-2 w-2 rounded-full bg-surgical-teal animate-ping" />
              <span>OPEN FOR COLLABORATIONS & BIOMEDICAL INNOVATION</span>
            </div>

            <div className="flex items-center gap-2 text-clinical-muted text-[11px]">
              <span>RESPONSE TIME: &lt;24 HOURS</span>
              <span>·</span>
              <span className="text-surgical-teal font-bold">INDORE, INDIA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT 6 COLS: 2x2 Action Tiles & Hospital Status */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-clinical-ink">
                  Direct Communication Channels
                </h3>
                <p className="text-xs sm:text-sm text-clinical-muted mt-1 leading-relaxed">
                  Based in Indore, MP, India. Reachable via phone, direct email, or LinkedIn.
                </p>
              </div>

              {/* 2x2 Action Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                {/* 1. Email Tile */}
                <div className="rounded-2xl border border-clinical-grid bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs hover:border-surgical-teal/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-surgical-teal/30 bg-surgical-teal/10 text-surgical-teal">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-clinical-muted">PRIMARY</span>
                    </div>
                    <span className="text-[10px] text-clinical-muted block uppercase">EMAIL:</span>
                    <span className="font-bold text-clinical-ink text-[11px] break-all block mt-0.5">
                      {personal.email}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-clinical-grid/60 flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${personal.email}`}
                      className="text-surgical-teal hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Send</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(personal.email, "email")}
                      className="flex items-center gap-1 rounded bg-white border border-clinical-grid px-2 py-1 text-[10px] text-clinical-muted hover:text-clinical-ink cursor-pointer"
                    >
                      {copiedField === "email" ? (
                        <>
                          <Check className="h-3 w-3 text-surgical-teal" />
                          <span className="text-surgical-teal font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Phone Tile */}
                <div className="rounded-2xl border border-clinical-grid bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs hover:border-medical-cobalt/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-medical-cobalt/30 bg-medical-cobalt/10 text-medical-cobalt">
                        <Phone className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-clinical-muted">DIRECT</span>
                    </div>
                    <span className="text-[10px] text-clinical-muted block uppercase">MOBILE:</span>
                    <span className="font-bold text-clinical-ink text-[11px] block mt-0.5">
                      {personal.phone}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-clinical-grid/60 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${personal.phone.replace(/\s+/g, "")}`}
                      className="text-medical-cobalt hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Call</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(personal.phone, "phone")}
                      className="flex items-center gap-1 rounded bg-white border border-clinical-grid px-2 py-1 text-[10px] text-clinical-muted hover:text-clinical-ink cursor-pointer"
                    >
                      {copiedField === "phone" ? (
                        <>
                          <Check className="h-3 w-3 text-medical-cobalt" />
                          <span className="text-medical-cobalt font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. LinkedIn Tile */}
                <div className="rounded-2xl border border-clinical-grid bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs hover:border-sky-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-600">
                        <LinkedinIcon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-clinical-muted">NETWORK</span>
                    </div>
                    <span className="text-[10px] text-clinical-muted block uppercase">LINKEDIN:</span>
                    <span className="font-bold text-clinical-ink text-[11px] block mt-0.5">
                      in/suhani-johare
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-clinical-grid/60 flex items-center justify-between">
                    <a
                      href={personal.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Open Profile</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* 4. GitHub Tile */}
                <div className="rounded-2xl border border-clinical-grid bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs hover:border-slate-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/30 bg-slate-500/10 text-slate-800">
                        <GithubIcon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-clinical-muted">CODEBASE</span>
                    </div>
                    <span className="text-[10px] text-clinical-muted block uppercase">GITHUB:</span>
                    <span className="font-bold text-clinical-ink text-[11px] block mt-0.5">
                      github.com/suhanijohare
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-clinical-grid/60 flex items-center justify-between">
                    <a
                      href={personal.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-800 hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Repositories</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Hospital Credentials Verified Footnote */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 font-mono text-xs flex items-center gap-3 shadow-2xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-800 block text-[11px]">
                    HOSPITAL VERIFICATION // VISHESH JUPITER
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Biomedical Engineer (Aug 2026 – Present) · Preventive Maintenance & Equipment R&D
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT 6 COLS: Direct Transmit Clinical Inquiry Form */}
            <div className="lg:col-span-6 rounded-2xl border border-clinical-grid bg-slate-50/80 p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-clinical-grid">
                <span className="font-mono text-xs font-bold text-clinical-ink">
                  DIRECT TRANSMIT // INQUIRY FORM
                </span>
                <span className="font-mono text-[10px] text-surgical-teal font-semibold">
                  ENCRYPTED CLIENT MAILTO
                </span>
              </div>

              <form onSubmit={handleTransmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-[10px] text-clinical-muted uppercase font-bold block">
                      YOUR FULL NAME:
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Dr. A. Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-clinical-grid bg-white px-3 py-2 text-clinical-ink focus:border-surgical-teal focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-org" className="text-[10px] text-clinical-muted uppercase font-bold block">
                      HOSPITAL / ORGANIZATION:
                    </label>
                    <input
                      id="contact-org"
                      type="text"
                      placeholder="e.g. Apollo Healthcare / SGSITS"
                      value={formData.org}
                      onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                      className="w-full rounded-lg border border-clinical-grid bg-white px-3 py-2 text-clinical-ink focus:border-surgical-teal focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-topic" className="text-[10px] text-clinical-muted uppercase font-bold block">
                    INQUIRY / CLINICAL TOPIC:
                  </label>
                  <select
                    id="contact-topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full rounded-lg border border-clinical-grid bg-white px-3 py-2 text-clinical-ink focus:border-surgical-teal focus:outline-none cursor-pointer"
                  >
                    <option value="Biomedical Equipment R&D / Hospital Engineering">
                      Biomedical Equipment R&D / Hospital Engineering
                    </option>
                    <option value="Preventive Maintenance & Calibration Consultation">
                      Preventive Maintenance & Calibration Consultation
                    </option>
                    <option value="Medical Image Processing / Machine Learning Collaboration">
                      Medical Image Processing / Machine Learning Collaboration
                    </option>
                    <option value="Recruitment & Full-Time Biomedical Opportunities">
                      Recruitment & Full-Time Biomedical Opportunities
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-message" className="text-[10px] text-clinical-muted uppercase font-bold block">
                    MESSAGE / PROJECT SCOPE:
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Describe your inquiry, project scope, or opportunity..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-clinical-grid bg-white px-3 py-2 text-clinical-ink focus:border-surgical-teal focus:outline-none resize-none"
                  />
                </div>

                <ClinicalButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center gap-2 shadow-clinical cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>TRANSMIT CLINICAL INQUIRY</span>
                </ClinicalButton>

                {isSent && (
                  <div className="rounded-lg bg-emerald-100 border border-emerald-300 p-2.5 text-center text-emerald-800 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>CLIENT MAIL TRANSMISSION INITIALIZED</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Diagnostic Copy Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-surgical-teal bg-white/95 px-4 py-2.5 font-mono text-xs font-bold text-clinical-ink shadow-clinical-lg backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-surgical-teal" />
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
}

export default ContactConsole;
