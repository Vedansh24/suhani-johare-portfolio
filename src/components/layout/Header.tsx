"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Mail, ArrowUpRight, Menu, X, Phone } from "lucide-react";
import { ClinicalButton } from "@/components/ui/ClinicalButton";

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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Overview", href: "hero" },
    { label: "Equipment Lab", href: "equipment-lab" },
    { label: "Experience", href: "experience" },
    { label: "Projects", href: "projects" },
    { label: "Skills", href: "skills" },
    { label: "Education", href: "education" },
    { label: "Contact", href: "contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-clinical-grid bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Biomedical Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-sm tracking-tight text-clinical-ink transition-opacity hover:opacity-85"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-surgical-teal/30 bg-gradient-to-br from-surgical-teal/15 to-medical-cobalt/15 text-surgical-teal shadow-2xs">
              <Activity className="h-4 w-4 text-surgical-teal animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-clinical-ink text-sm sm:text-base">
                  SJ // BIOMED
                </span>
                <span className="rounded bg-clinical-grid/60 px-1 py-0.2 text-[9px] font-mono text-clinical-muted">
                  BME
                </span>
              </div>
              <span className="text-[10px] text-clinical-muted font-mono leading-none">
                SUHANI JOHARE · CLINICAL SYSTEMS
              </span>
            </div>
          </Link>

          {/* Real-time Hospital Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-surgical-teal/25 bg-surgical-teal/5 px-3 py-1 text-[11px] font-mono text-surgical-teal">
            <span className="h-2 w-2 rounded-full bg-surgical-teal animate-ping" />
            <span className="font-semibold">ACTIVE // VISHESH JUPITER HOSPITAL</span>
          </div>
        </div>

        {/* Clinical Section Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 font-mono text-xs text-clinical-muted">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={`#${item.href}`}
              onClick={(e) => handleScrollTo(e, item.href)}
              className="rounded-md px-2.5 py-1.5 transition-all hover:text-clinical-ink hover:bg-clinical-grid/60"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Primary Connect Action & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            onClick={(e) => handleScrollTo(e, "contact")}
            className="hidden sm:inline-flex"
          >
            <ClinicalButton variant="primary" size="sm" className="gap-1.5 text-xs shadow-2xs">
              <Mail className="h-3.5 w-3.5" />
              <span>CONNECT</span>
              <ArrowUpRight className="h-3 w-3 opacity-70" />
            </ClinicalButton>
          </a>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-clinical-grid bg-white text-clinical-ink transition-colors hover:bg-clinical-grid/40"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 2-Column Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-clinical-grid bg-white/98 backdrop-blur-2xl p-4 shadow-clinical-lg">
          <div className="grid grid-cols-2 gap-4 pb-2">
            {/* Left Column: Navigation Anchors */}
            <div className="space-y-1 border-r border-clinical-grid pr-3 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-clinical-muted tracking-wider block mb-1">
                SECTIONS
              </span>
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={`#${item.href}`}
                  onClick={(e) => handleScrollTo(e, item.href)}
                  className="block rounded px-2 py-1.5 text-clinical-ink hover:bg-clinical-grid/60 hover:text-surgical-teal transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right Column: Quick Contact & Metadata */}
            <div className="space-y-3 font-mono text-xs pl-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-clinical-muted tracking-wider block mb-1">
                  DUTY HOSPITAL
                </span>
                <p className="text-clinical-ink font-semibold text-[11px] leading-tight">
                  Vishesh Jupiter Hospital
                </p>
                <span className="text-[10px] text-clinical-muted">Indore, India</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-clinical-muted tracking-wider block mb-1">
                  DIRECT CHANNELS
                </span>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  <a
                    href="mailto:joharesuhani@gmail.com"
                    className="flex items-center gap-1.5 text-surgical-teal hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    <span>Email Suhani</span>
                  </a>
                  <a
                    href="tel:+916261076103"
                    className="flex items-center gap-1.5 text-clinical-ink hover:text-surgical-teal"
                  >
                    <Phone className="h-3 w-3" />
                    <span>+91 6261076103</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/suhani-johare"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-medical-cobalt hover:underline"
                  >
                    <LinkedinIcon className="h-3 w-3" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/suhanijohare"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-clinical-ink hover:underline"
                  >
                    <GithubIcon className="h-3 w-3" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
