"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type MonitorMode = "normal" | "calibration" | "diagnostic";

const MODE_CONFIG: Record<
    MonitorMode,
    {
        hr: string;
        spo2: string;
        resp: string;
        status: string;
        ledColor: string;
        speed: number;
    }
> = {
    normal: {
        hr: "72",
        spo2: "99",
        resp: "16",
        status: "STATUS: SINUS RHYTHM NORMAL • CAL OK",
        ledColor: "#0D9488",
        speed: 1.0,
    },
    calibration: {
        hr: "60",
        spo2: "100",
        resp: "12",
        status: "STATUS: 1.0 mV SQUARE-WAVE CALIBRATION ACTIVE",
        ledColor: "#0284C7",
        speed: 0.75,
    },
    diagnostic: {
        hr: "108",
        spo2: "98",
        resp: "22",
        status: "STATUS: HIGH-SPEED DIAGNOSTIC STRESS SWEEP",
        ledColor: "#EF4444",
        speed: 1.65,
    },
};

function ecgNormalWave(phase: number): number {
    let y = 0;
    if (phase > 0.1 && phase < 0.22) {
        y += 0.16 * Math.sin(((phase - 0.1) / 0.12) * Math.PI);
    }
    if (phase >= 0.27 && phase < 0.3) {
        y -= 0.18 * Math.sin(((phase - 0.27) / 0.03) * Math.PI);
    }
    if (phase >= 0.3 && phase < 0.35) {
        y += 1.0 * Math.sin(((phase - 0.3) / 0.05) * Math.PI);
    }
    if (phase >= 0.35 && phase < 0.39) {
        y -= 0.32 * Math.sin(((phase - 0.35) / 0.04) * Math.PI);
    }
    if (phase >= 0.5 && phase < 0.72) {
        y += 0.28 * Math.sin(((phase - 0.5) / 0.22) * Math.PI);
    }
    return y;
}

function spo2PlethWave(phase: number): number {
    const main = Math.sin(phase * Math.PI * 2);
    const harmonic = 0.38 * Math.sin(phase * Math.PI * 4 - 0.9);
    const notch = 0.16 * Math.sin(phase * Math.PI * 6 - 1.5);
    return (main + harmonic + notch) * 0.52;
}

function respWave(phase: number): number {
    return Math.sin(phase * Math.PI * 2) * 0.65 + 0.12 * Math.sin(phase * Math.PI * 4);
}

function resizeCanvasToContainer(canvas: HTMLCanvasElement | null) {
    if (!canvas) return { w: 0, h: 0, ctx: null as CanvasRenderingContext2D | null };
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return { w, h, ctx };
}

const ML_NODES = [
    { id: 0, cx: 85, cy: 88, r: 22, fill: "#E0F2FE", stroke: "#0284C7", textColor: "#0369A1", text: "INPUT", label: "QUERY VECTOR // SCI-FI", score: "TOP MATCH: 0.94" },
    { id: 1, cx: 205, cy: 42, r: 18, fill: "#F0FDFA", stroke: "#0D9488", textColor: "#0F766E", text: "0.94", label: "VECTORIZE // TF-IDF", score: "COSINE: 0.94" },
    { id: 2, cx: 210, cy: 132, r: 18, fill: "#F0FDFA", stroke: "#0D9488", textColor: "#0F766E", text: "0.89", label: "GENRE WEIGHT // PANDAS", score: "COSINE: 0.89" },
    { id: 3, cx: 335, cy: 48, r: 16, fill: "#FFFFFF", stroke: "#0284C7", textColor: "#0369A1", text: "REC 1", label: "REC #1 // HIGH AFFINITY", score: "RANK #1 (94%)" },
    { id: 4, cx: 325, cy: 105, r: 16, fill: "#FFFFFF", stroke: "#0D9488", textColor: "#0F766E", text: "REC 2", label: "REC #2 // SIMILAR CAST", score: "RANK #2 (91%)" },
    { id: 5, cx: 345, cy: 148, r: 15, fill: "#FFFFFF", stroke: "#64748B", textColor: "#475569", text: "REC 3", label: "REC #3 // DIRECTOR TAG", score: "RANK #3 (86%)" },
];

const ML_EDGES = [
    { a: 0, b: 1, x1: 85, y1: 88, x2: 205, y2: 42, dashed: false },
    { a: 0, b: 2, x1: 85, y1: 88, x2: 210, y2: 132, dashed: false },
    { a: 1, b: 3, x1: 205, y1: 42, x2: 335, y2: 48, dashed: false },
    { a: 1, b: 4, x1: 205, y1: 42, x2: 325, y2: 105, dashed: false },
    { a: 2, b: 4, x1: 210, y1: 132, x2: 325, y2: 105, dashed: false },
    { a: 2, b: 5, x1: 210, y1: 132, x2: 345, y2: 148, dashed: false },
    { a: 0, b: 4, x1: 85, y1: 88, x2: 325, y2: 105, dashed: true },
];

const RESP_CARDS = [
    {
        num: "01",
        layerLabel: "Layer 01 // Clinical Interface & QA",
        layerColor: "text-teal-600",
        title: "Preventive Maintenance & Calibration",
        badge: "IEC 60601",
        badgeClass: "bg-teal-50 text-teal-700",
        desc: "Perform scheduled preventive maintenance, calibration, and electrical safety inspections on diagnostic, monitoring, and life-support medical equipment across hospital departments.",
    },
    {
        num: "02",
        layerLabel: "Layer 02 // Sensor PCB & Diagnostics",
        layerColor: "text-sky-600",
        title: "Rapid Breakdown Troubleshooting",
        badge: "ZERO DOWNTIME",
        badgeClass: "bg-sky-50 text-sky-700",
        desc: "Troubleshoot and resolve equipment breakdowns promptly to minimize clinical downtime and support uninterrupted patient care.",
    },
    {
        num: "03",
        layerLabel: "Layer 03 // Pneumatic & Asset Core",
        layerColor: "text-teal-600",
        title: "Inventory, AMC/CMC & Compliance",
        badge: "AUDIT READY",
        badgeClass: "bg-slate-100 text-slate-700",
        desc: "Maintain medical equipment inventory, service histories, AMC/CMC records, and compliance documentation in accordance with hospital quality standards.",
    },
    {
        num: "04",
        layerLabel: "Layer 04 // Safety & Deployment",
        layerColor: "text-red-500",
        title: "Vendor & Clinical Staff Coordination",
        badge: "SAFE OPS",
        badgeClass: "bg-red-50 text-red-600",
        desc: "Coordinate with vendors and service engineers for equipment installation, repairs, and technical guidance to nursing and clinical staff on safe device operation.",
    },
];

const LAYER_TABS = [
    "01 Display Casing",
    "02 Sensor PCB",
    "03 Pneumatic Core",
    "04 Safety Power",
];

const SPINE_SECTIONS = [
    { id: "hero", label: "01 OVERVIEW", title: "01 // Live Vitals" },
    { id: "equipment-lab", label: "02 EQUIPMENT LAB", title: "02 // Exploded View" },
    { id: "experience", label: "03 EXPERIENCE", title: "03 // X-Ray Timeline" },
    { id: "projects", label: "04 PROJECTS", title: "04 // Bio & Tech Lab" },
    { id: "skills", label: "05 SKILLS", title: "05 // Calibration Matrix" },
    { id: "education", label: "06 EDUCATION", title: "06 // Education" },
    { id: "contact", label: "07 CONTACT", title: "07 // Contact Console" },
];

export default function ClinicalPortfolio() {
    const rootRef = useRef<HTMLDivElement>(null);

    // Chrome & UI state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [monitorMode, setMonitorMode] = useState<MonitorMode>("normal");
    const monitorModeRef = useRef<MonitorMode>("normal");
    const [monitorClock, setMonitorClock] = useState("--:--:--");
    const [activeLayerIdx, setActiveLayerIdx] = useState(0);
    const activeLayerIdxRef = useRef(0);
    const [activeSpineId, setActiveSpineId] = useState("hero");
    const [priorityMode, setPriorityMode] = useState(false);
    const priorityModeRef = useRef(false);
    const [activeMlNode, setActiveMlNode] = useState(0);
    const [pirActive, setPirActive] = useState(false);
    const [pirTarget, setPirTarget] = useState({ x: 275, y: 88 });
    const [toast, setToast] = useState({ visible: false, message: "EMAIL COPIED TO CLIPBOARD" });

    // DOM refs for high-frequency 60fps imperative updates
    const preloaderRef = useRef<HTMLDivElement>(null);
    const cursorRingRef = useRef<HTMLDivElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const heroBgCanvasRef = useRef<HTMLCanvasElement>(null);
    const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
    const spo2CanvasRef = useRef<HTMLCanvasElement>(null);
    const respCanvasRef = useRef<HTMLCanvasElement>(null);

    const spineProgressRef = useRef<HTMLDivElement>(null);
    const spineDotRef = useRef<HTMLDivElement>(null);
    const scrollPctRef = useRef<HTMLSpanElement>(null);

    const lenis = useLenis();
    const explodedTriggerRef = useRef<ScrollTrigger | null>(null);
    const carrierRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
    const plateRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
    const explosionReadoutRef = useRef<HTMLSpanElement>(null);
    const explosionBarRef = useRef<HTMLDivElement>(null);

    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const scannerBeamRef = useRef<HTMLDivElement>(null);
    const spineFillRef = useRef<HTMLDivElement>(null);
    const depthReadoutRef = useRef<HTMLSpanElement>(null);

    const veinSvgRef = useRef<SVGSVGElement>(null);
    const nirClipCircleRef = useRef<SVGCircleElement>(null);
    const nirLensRingRef = useRef<SVGGElement>(null);
    const veinCoordsRef = useRef<HTMLSpanElement>(null);

    const ambulanceRouteRef = useRef<SVGPathElement>(null);
    const ambulanceUnitRef = useRef<SVGGElement>(null);
    const ambulanceEtaRef = useRef<HTMLSpanElement>(null);
    const ambulanceStatusRef = useRef<HTMLSpanElement>(null);

    const pirSvgRef = useRef<SVGSVGElement>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pirResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        monitorModeRef.current = monitorMode;
    }, [monitorMode]);

    useEffect(() => {
        priorityModeRef.current = priorityMode;
    }, [priorityMode]);

    const applyExplosionProgress = useCallback((p: number) => {
        const clamped = Math.max(0, Math.min(1, p));
        const pct = Math.round(clamped * 100);
        if (explosionReadoutRef.current) {
            explosionReadoutRef.current.textContent = `EXPLOSION: ${pct}%`;
        }
        if (explosionBarRef.current) {
            explosionBarRef.current.style.transform = `scaleX(${clamped})`;
        }

        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        const scale = isMobile ? 0.68 : 0.76;
        const rotZ = -26 + clamped * 8; // dynamic mechanical opening: -26deg to -18deg

        // Pure vertical Y translation for carrier wrappers:
        // Assembled (0): [-24, -8, +8, +24]
        // Exploded (1): [-120, -40, +40, +120]
        const carrierY = [
            -24 - clamped * 96,
            -8 - clamped * 32,
            8 + clamped * 32,
            24 + clamped * 96,
        ];

        carrierRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.transform = `translate3d(0, ${carrierY[i].toFixed(1)}px, 0)`;
        });

        plateRefs.current.forEach((el) => {
            if (!el) return;
            el.style.transform = `perspective(1200px) rotateX(52deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale})`;
        });

        const idx = Math.min(3, Math.floor(clamped * 4));
        if (idx !== activeLayerIdxRef.current) {
            activeLayerIdxRef.current = idx;
            setActiveLayerIdx(idx);
        }
    }, []);

    const inspectLayerByClick = useCallback(
        (idx: number) => {
            activeLayerIdxRef.current = idx;
            setActiveLayerIdx(idx);
            const targetProgress = (idx + 0.5) / 4;
            if (window.innerWidth >= 1024 && explodedTriggerRef.current) {
                const st = explodedTriggerRef.current;
                const targetScroll = st.start + (st.end - st.start) * targetProgress;
                if (lenis) {
                    lenis.scrollTo(targetScroll, { duration: 1.0 });
                } else {
                    window.scrollTo({ top: targetScroll, behavior: "smooth" });
                }
            } else {
                applyExplosionProgress(targetProgress);
            }
        },
        [applyExplosionProgress, lenis]
    );

    // 1. Preloader fast dismissal
    useEffect(() => {
        const preloader = preloaderRef.current;
        if (!preloader) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
            preloader.style.display = "none";
            return;
        }

        const timer = setTimeout(() => {
            gsap.to(preloader, {
                yPercent: -100,
                opacity: 0,
                duration: 0.55,
                ease: "power3.inOut",
                onComplete: () => {
                    if (preloader) preloader.style.display = "none";
                },
            });
        }, 1080);

        return () => clearTimeout(timer);
    }, []);

    // 2. Hydration-safe live monitor clock
    useEffect(() => {
        const tick = () => setMonitorClock(new Date().toTimeString().slice(0, 8));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // 3. Custom desktop medical caliper cursor
    useEffect(() => {
        const ring = cursorRingRef.current;
        const dot = cursorDotRef.current;
        if (!ring || !dot) return;
        const supportsFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!supportsFine) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let rafId = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.opacity = "1";
            ring.style.opacity = "1";
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        };

        const onMouseLeave = () => {
            dot.style.opacity = "0";
            ring.style.opacity = "0";
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest(".interactive-target, a, button")) {
                ring.classList.add("is-active");
                dot.classList.add("is-active");
            }
        };

        const onMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest(".interactive-target, a, button")) {
                ring.classList.remove("is-active");
                dot.classList.remove("is-active");
            }
        };

        const animateCursor = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            rafId = requestAnimationFrame(animateCursor);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);
        document.addEventListener("mouseover", onMouseOver);
        document.addEventListener("mouseout", onMouseOut);
        rafId = requestAnimationFrame(animateCursor);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
            document.removeEventListener("mouseover", onMouseOver);
            document.removeEventListener("mouseout", onMouseOut);
        };
    }, []);

    // 4. Live Hero ECG + Multiparameter Patient Monitor Canvas Loop
    useEffect(() => {
        let timeTick = 0;
        let rafId = 0;

        const renderWaveforms = () => {
            const mode = monitorModeRef.current;
            const cfg = MODE_CONFIG[mode];
            timeTick += 0.014 * cfg.speed;

            // A) Hero Background Continuous ECG
            if (heroBgCanvasRef.current) {
                const { w, h, ctx } = resizeCanvasToContainer(heroBgCanvasRef.current);
                if (ctx) {
                    ctx.clearRect(0, 0, w, h);
                    const baseline = h * 0.54;
                    const cyclePx = 220;
                    const offset = (timeTick * 115) % cyclePx;

                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(13, 148, 136, 0.24)";
                    ctx.lineWidth = 2;

                    for (let x = 0; x <= w; x += 2) {
                        const phase = ((((x + offset) % cyclePx) + cyclePx) % cyclePx) / cyclePx;
                        const y = baseline - ecgNormalWave(phase) * 72;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const headX = (timeTick * 165) % w;
                    const headPhase = ((((headX + offset) % cyclePx) + cyclePx) % cyclePx) / cyclePx;
                    const headY = baseline - ecgNormalWave(headPhase) * 72;
                    ctx.beginPath();
                    ctx.arc(headX, headY, 4, 0, Math.PI * 2);
                    ctx.fillStyle = "#EF4444";
                    ctx.fill();
                }
            }

            // B) Monitor Channel 1: ECG Lead II
            if (ecgCanvasRef.current) {
                const { w, h, ctx } = resizeCanvasToContainer(ecgCanvasRef.current);
                if (ctx) {
                    ctx.clearRect(0, 0, w, h);
                    const midY = h * 0.6;
                    const amp = h * 0.44;
                    const cycle = mode === "diagnostic" ? 74 : 112;
                    const sweepX = (timeTick * 120) % w;

                    ctx.beginPath();
                    ctx.lineWidth = 2.1;
                    ctx.strokeStyle = mode === "diagnostic" ? "#EF4444" : "#0D9488";

                    for (let x = 0; x <= w; x += 1.5) {
                        const distAhead = (x - sweepX + w) % w;
                        if (distAhead < 14) {
                            ctx.stroke();
                            ctx.beginPath();
                            continue;
                        }
                        const phase = (x % cycle) / cycle;
                        const val =
                            mode === "calibration"
                                ? phase > 0.25 && phase < 0.65
                                    ? 0.85
                                    : 0
                                : ecgNormalWave(phase);
                        const y = midY - val * amp;
                        if (x === 0 || distAhead < 16) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const headPhase = (sweepX % cycle) / cycle;
                    const headVal =
                        mode === "calibration"
                            ? headPhase > 0.25 && headPhase < 0.65
                                ? 0.85
                                : 0
                            : ecgNormalWave(headPhase);
                    ctx.beginPath();
                    ctx.arc(sweepX, midY - headVal * amp, 3.2, 0, Math.PI * 2);
                    ctx.fillStyle = "#EF4444";
                    ctx.fill();
                }
            }

            // C) Monitor Channel 2: SpO2 Pleth
            if (spo2CanvasRef.current) {
                const { w, h, ctx } = resizeCanvasToContainer(spo2CanvasRef.current);
                if (ctx) {
                    ctx.clearRect(0, 0, w, h);
                    const midY = h * 0.52;
                    const amp = h * 0.36;
                    const cycle = mode === "diagnostic" ? 68 : 96;
                    const sweepX = (timeTick * 120) % w;

                    ctx.beginPath();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#0284C7";

                    for (let x = 0; x <= w; x += 2) {
                        const distAhead = (x - sweepX + w) % w;
                        if (distAhead < 14) {
                            ctx.stroke();
                            ctx.beginPath();
                            continue;
                        }
                        const phase = (x % cycle) / cycle;
                        const val =
                            mode === "calibration"
                                ? Math.sin(phase * Math.PI * 2) * 0.75
                                : spo2PlethWave(phase);
                        const y = midY - val * amp;
                        if (x === 0 || distAhead < 16) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const headPhase = (sweepX % cycle) / cycle;
                    const headVal =
                        mode === "calibration"
                            ? Math.sin(headPhase * Math.PI * 2) * 0.75
                            : spo2PlethWave(headPhase);
                    ctx.beginPath();
                    ctx.arc(sweepX, midY - headVal * amp, 2.8, 0, Math.PI * 2);
                    ctx.fillStyle = "#0284C7";
                    ctx.fill();
                }
            }

            // D) Monitor Channel 3: Respiration
            if (respCanvasRef.current) {
                const { w, h, ctx } = resizeCanvasToContainer(respCanvasRef.current);
                if (ctx) {
                    ctx.clearRect(0, 0, w, h);
                    const midY = h * 0.52;
                    const amp = h * 0.34;
                    const cycle = mode === "diagnostic" ? 110 : 165;
                    const sweepX = (timeTick * 95) % w;

                    ctx.beginPath();
                    ctx.lineWidth = 1.8;
                    ctx.strokeStyle = "#475569";

                    for (let x = 0; x <= w; x += 2) {
                        const distAhead = (x - sweepX + w) % w;
                        if (distAhead < 12) {
                            ctx.stroke();
                            ctx.beginPath();
                            continue;
                        }
                        const phase = (x % cycle) / cycle;
                        const val = respWave(phase);
                        const y = midY - val * amp;
                        if (x === 0 || distAhead < 14) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            }

            rafId = requestAnimationFrame(renderWaveforms);
        };

        rafId = requestAnimationFrame(renderWaveforms);
        return () => cancelAnimationFrame(rafId);
    }, []);

    // 5. Interactive Vein Detector Auto-Sweep & Pointer Tracking
    useEffect(() => {
        const svg = veinSvgRef.current;
        const clipCircle = nirClipCircleRef.current;
        const lensRing = nirLensRingRef.current;
        const coordsLabel = veinCoordsRef.current;
        if (!svg || !clipCircle || !lensRing) return;

        let isUserControlling = false;
        let autoAngle = 0;
        let rafId = 0;

        const setLensPos = (x: number, y: number) => {
            const cx = Math.max(58, Math.min(462, x));
            const cy = Math.max(54, Math.min(136, y));
            clipCircle.setAttribute("cx", cx.toFixed(1));
            clipCircle.setAttribute("cy", cy.toFixed(1));
            lensRing.setAttribute("transform", `translate(${cx.toFixed(1)}, ${cy.toFixed(1)})`);
            if (coordsLabel && isUserControlling) {
                coordsLabel.textContent = `SCAN X:${Math.round(cx)} Y:${Math.round(cy)} • VEIN LOCK`;
            }
        };

        const handlePointer = (clientX: number, clientY: number) => {
            const rect = svg.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 520;
            const y = ((clientY - rect.top) / rect.height) * 190;
            isUserControlling = true;
            setLensPos(x, y);
        };

        const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
        const onMouseLeave = () => {
            isUserControlling = false;
            if (coordsLabel) coordsLabel.textContent = "AUTO-SWEEP • MOVE CURSOR TO SCAN";
        };
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onTouchEnd = () => {
            isUserControlling = false;
        };

        svg.addEventListener("mousemove", onMouseMove);
        svg.addEventListener("mouseleave", onMouseLeave);
        svg.addEventListener("touchstart", onTouchStart, { passive: true });
        svg.addEventListener("touchmove", onTouchMove, { passive: true });
        svg.addEventListener("touchend", onTouchEnd);

        const autoSweep = () => {
            if (!isUserControlling) {
                autoAngle += 0.018;
                const cx = 260 + Math.sin(autoAngle) * 155;
                const cy = 96 + Math.cos(autoAngle * 1.4) * 16;
                setLensPos(cx, cy);
            }
            rafId = requestAnimationFrame(autoSweep);
        };
        rafId = requestAnimationFrame(autoSweep);

        return () => {
            cancelAnimationFrame(rafId);
            svg.removeEventListener("mousemove", onMouseMove);
            svg.removeEventListener("mouseleave", onMouseLeave);
            svg.removeEventListener("touchstart", onTouchStart);
            svg.removeEventListener("touchmove", onTouchMove);
            svg.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    // 6. Interactive Rescue Ready Ambulance Route Animation
    useEffect(() => {
        const route = ambulanceRouteRef.current;
        const unit = ambulanceUnitRef.current;
        if (!route || !unit) return;

        const totalLen = route.getTotalLength();
        let progress = 0;
        let rafId = 0;

        const animateAmbulance = () => {
            const speedMult = priorityModeRef.current ? 2.2 : 1;
            progress += 0.0022 * speedMult;
            if (progress > 1) progress = 0;

            const pt = route.getPointAtLength(progress * totalLen);
            unit.setAttribute("transform", `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

            const remainingSec = Math.max(0, Math.round((1 - progress) * 260));
            const mins = String(Math.floor(remainingSec / 60)).padStart(2, "0");
            const secs = String(remainingSec % 60).padStart(2, "0");
            if (ambulanceEtaRef.current) {
                ambulanceEtaRef.current.textContent = `ETA ${mins}m ${secs}s`;
            }
            if (ambulanceStatusRef.current) {
                if (progress < 0.15) ambulanceStatusRef.current.textContent = "AMB-04 // DISPATCHED";
                else if (progress < 0.85) ambulanceStatusRef.current.textContent = "AMB-04 // EN ROUTE";
                else ambulanceStatusRef.current.textContent = "AMB-04 // ARRIVING ER";
            }

            rafId = requestAnimationFrame(animateAmbulance);
        };

        rafId = requestAnimationFrame(animateAmbulance);
        return () => cancelAnimationFrame(rafId);
    }, []);

    // 7. GSAP Master ScrollTrigger Choreography (StrictMode Safe)
    useGSAP(
        () => {
            // Hero entrance stagger
            gsap.from(".hero-stagger", {
                y: 24,
                opacity: 0,
                duration: 0.75,
                stagger: 0.08,
                ease: "power3.out",
                delay: 0.55,
                clearProps: "transform,opacity",
            });

            // Right-edge ECG spine progress
            ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: (self) => {
                    const pct = Math.round(self.progress * 100);
                    if (spineProgressRef.current) spineProgressRef.current.style.height = `${pct}%`;
                    if (spineDotRef.current) spineDotRef.current.style.top = `${pct}%`;
                    if (scrollPctRef.current) {
                        scrollPctRef.current.textContent = `${String(pct).padStart(2, "0")}%`;
                    }
                },
            });

            // Highlight spine node per section
            SPINE_SECTIONS.forEach(({ id }) => {
                const sec = document.getElementById(id);
                if (!sec) return;
                ScrollTrigger.create({
                    trigger: sec,
                    start: "top 55%",
                    end: "bottom 45%",
                    onToggle: (self) => {
                        if (self.isActive) setActiveSpineId(id);
                    },
                });
            });

            // Responsive MatchMedia for Pinned Exploded View
            const mm = gsap.matchMedia();

            mm.add("(min-width: 1024px)", () => {
                applyExplosionProgress(0);
                explodedTriggerRef.current = ScrollTrigger.create({
                    trigger: "#equipment-lab",
                    start: "top top+=64",
                    end: "+=1400",
                    pin: "#exploded-pin-wrapper",
                    scrub: 0.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => applyExplosionProgress(self.progress),
                });
                return () => {
                    explodedTriggerRef.current?.kill();
                    explodedTriggerRef.current = null;
                };
            });

            mm.add("(max-width: 1023px)", () => {
                applyExplosionProgress(0.35);
                const mobileTrigger = ScrollTrigger.create({
                    trigger: "#equipment-lab",
                    start: "top 75%",
                    end: "bottom 40%",
                    scrub: 0.5,
                    onUpdate: (self) => applyExplosionProgress(self.progress),
                });
                return () => mobileTrigger.kill();
            });

            // Diagnostic X-Ray Scanner Beam
            const timelineContainer = timelineContainerRef.current;
            const scannerBeam = scannerBeamRef.current;
            if (timelineContainer && scannerBeam) {
                const xrayItems = timelineContainer.querySelectorAll(".xray-item");
                ScrollTrigger.create({
                    trigger: timelineContainer,
                    start: "top 62%",
                    end: "bottom 58%",
                    scrub: 0.4,
                    onUpdate: (self) => {
                        const p = self.progress;
                        const pct = (p * 94 + 3).toFixed(2);
                        scannerBeam.style.top = `${pct}%`;
                        if (spineFillRef.current) spineFillRef.current.style.height = `${pct}%`;
                        if (depthReadoutRef.current) {
                            depthReadoutRef.current.textContent = `${String(Math.round(p * 320)).padStart(3, "0")} mm`;
                        }

                        const beamRect = scannerBeam.getBoundingClientRect();
                        const beamCenter = beamRect.top + beamRect.height / 2;

                        xrayItems.forEach((item) => {
                            const card = item.querySelector(".timeline-card");
                            if (!card) return;
                            const rect = card.getBoundingClientRect();
                            const isScanned = beamCenter >= rect.top - 40 && beamCenter <= rect.bottom + 40;
                            const hasPassed = beamCenter > rect.top;
                            card.classList.toggle("xray-active", isScanned || hasPassed);
                        });
                    },
                });
            }

            // Parallax Medical Vector Props
            gsap.utils.toArray<HTMLElement>(".parallax-prop").forEach((prop) => {
                const speed = Number(prop.dataset.speed || 30);
                gsap.to(prop, {
                    y: speed * 2.2,
                    rotation: speed > 0 ? 8 : -8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#experience",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            });

            // Bento Project Cards Reveal
            gsap.from(".project-reveal", {
                y: 36,
                opacity: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: "power2.out",
                clearProps: "transform,opacity",
                scrollTrigger: {
                    trigger: "#projects",
                    start: "top 80%",
                    once: true,
                },
            });

            // Skill Calibration Bars & Radial Gauges
            ScrollTrigger.create({
                trigger: "#skills",
                start: "top 78%",
                once: true,
                onEnter: () => {
                    gsap.utils.toArray<HTMLElement>(".skill-fill").forEach((bar, i) => {
                        gsap.to(bar, {
                            width: bar.dataset.width || "85%",
                            duration: 1.05,
                            delay: i * 0.06,
                            ease: "power3.out",
                        });
                    });
                    gsap.utils.toArray<SVGCircleElement>(".radial-gauge").forEach((circle, i) => {
                        gsap.to(circle, {
                            strokeDashoffset: Number(circle.dataset.target || 20),
                            duration: 1.2,
                            delay: i * 0.12,
                            ease: "power3.out",
                        });
                    });
                },
            });

            // Education & Beyond the Lab Reveal
            gsap.from(".edu-reveal", {
                y: 28,
                opacity: 0,
                duration: 0.65,
                stagger: 0.1,
                ease: "power2.out",
                clearProps: "transform,opacity",
                scrollTrigger: {
                    trigger: "#education",
                    start: "top 82%",
                    once: true,
                },
            });

            if (typeof document !== "undefined") {
                document.fonts?.ready?.then(() => ScrollTrigger.refresh());
            }
            const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 350);
            return () => clearTimeout(refreshTimer);
        },
        { scope: rootRef, dependencies: [applyExplosionProgress] }
    );

    // PIR Handlers
    const handlePirPointer = (clientX: number, clientY: number) => {
        const svg = pirSvgRef.current;
        if (!svg) return;
        if (pirResetTimerRef.current) clearTimeout(pirResetTimerRef.current);
        const rect = svg.getBoundingClientRect();
        const x = Math.max(85, Math.min(370, ((clientX - rect.left) / rect.width) * 420));
        const y = Math.max(32, Math.min(145, ((clientY - rect.top) / rect.height) * 175));
        setPirActive(true);
        setPirTarget({ x, y });
    };

    // Toast & Copy Email
    const showToast = (message: string) => {
        setToast({ visible: true, message });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 2600);
    };

    const handleCopyEmail = async () => {
        const email = "joharesuhani@gmail.com";
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(email);
            } else {
                const tempInput = document.createElement("textarea");
                tempInput.value = email;
                tempInput.setAttribute("readonly", "");
                tempInput.style.position = "fixed";
                tempInput.style.opacity = "0";
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
            }
            showToast("COPIED // joharesuhani@gmail.com");
        } catch {
            showToast("EMAIL: joharesuhani@gmail.com");
        }
    };

    const currentMonitorCfg = MODE_CONFIG[monitorMode];
    const currentMlNode = ML_NODES[activeMlNode] ?? ML_NODES[0];

    return (
        <div ref={rootRef}>
            {/* CUSTOM MEDICAL CALIPER CURSOR */}
            <div ref={cursorRingRef} className="custom-cursor-ring" aria-hidden="true" />
            <div ref={cursorDotRef} className="custom-cursor-dot" aria-hidden="true" />

            {/* CLINICAL BOOT-UP PRELOADER */}
            <div ref={preloaderRef} id="preloader" role="status" aria-label="Calibrating portfolio interface">
                <div className="w-full max-w-md px-6 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3.5 py-1 shadow-sm">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <span className="font-mono text-[11px] font-semibold tracking-widest text-slate-600">
                            BIOMEDICAL TELEMETRY BOOT
                        </span>
                    </div>
                    <svg viewBox="0 0 360 80" className="mx-auto h-20 w-full overflow-visible" fill="none">
                        <line x1="0" y1="45" x2="360" y2="45" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                        <path
                            className="preloader-ecg-path"
                            d="M 10 45 L 110 45 L 122 45 L 130 37 L 138 45 L 152 45 L 160 54 L 172 10 L 184 68 L 194 45 L 210 45 L 222 33 L 236 45 L 350 45"
                            stroke="#0D9488"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="172" cy="10" r="4" fill="#EF4444" className="animate-ping" />
                        <circle cx="172" cy="10" r="3" fill="#EF4444" />
                    </svg>
                    <p className="mt-2 font-mono text-xs font-semibold tracking-[0.22em] text-teal-700">
                        SYSTEM CALIBRATED // SUHANI JOHARE
                    </p>
                </div>
            </div>

            {/* CONTINUOUS SCROLL-LINKED ECG SPINE */}
            <aside
                aria-label="Section telemetry navigation"
                className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/80 px-2 py-4 shadow-clinical backdrop-blur-md xl:flex"
            >
                <span className="font-mono text-[9px] font-bold tracking-widest text-teal-700">ECG</span>
                <div className="relative flex h-64 w-5 flex-col items-center justify-between py-1">
                    <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-slate-200" />
                    <div
                        ref={spineProgressRef}
                        className="absolute left-1/2 top-0 w-[2.5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-teal-500 via-sky-500 to-red-500"
                        style={{ height: "0%" }}
                    />
                    <div
                        ref={spineDotRef}
                        className="pointer-events-none absolute left-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow-glow-vital"
                        style={{ top: "0%" }}
                    />

                    {SPINE_SECTIONS.map((sec) => {
                        const isActive = activeSpineId === sec.id;
                        return (
                            <a
                                key={sec.id}
                                href={`#${sec.id}`}
                                title={sec.title}
                                className={`spine-node group relative z-20 flex h-3 w-3 items-center justify-center rounded-full border transition-all hover:scale-125 hover:border-teal-600 ${isActive
                                    ? "scale-125 border-teal-600 bg-teal-600"
                                    : "border-slate-300 bg-white"
                                    }`}
                            >
                                <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-medium text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                                    {sec.label}
                                </span>
                            </a>
                        );
                    })}
                </div>
                <span ref={scrollPctRef} className="font-mono text-[10px] font-semibold text-slate-500">
                    00%
                </span>
            </aside>

            {/* STICKY GLASS NAVIGATION BAR */}
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <a
                        href="#hero"
                        className="interactive-target flex items-center gap-2.5 rounded-xl px-2 py-1 transition-colors hover:bg-slate-100/70"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-sm">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="2 12 6 12 9 4 13 20 16 12 22 12" />
                            </svg>
                        </span>
                        <span className="font-mono text-sm font-bold tracking-wider text-slate-900">
                            SJ <span className="text-teal-600">{"//"}</span> BIOMED
                        </span>
                    </a>

                    <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
                        <a href="#hero" className="interactive-target rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700">Overview</a>
                        <a href="#equipment-lab" className="interactive-target rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700">Equipment Lab</a>
                        <a href="#experience" className="interactive-target rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700">Experience</a>
                        <a href="#projects" className="interactive-target rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700">Projects</a>
                        <a href="#education" className="interactive-target rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700">Education</a>
                        <a href="#contact" className="interactive-target rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700">Contact</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-full border border-teal-200/90 bg-teal-50/70 px-3.5 py-1.5 shadow-sm sm:flex">
                            <span className="vital-ping h-2 w-2 rounded-full bg-red-500" />
                            <span className="font-mono text-[10px] font-semibold tracking-wider text-teal-900">
                                ACTIVE // VISHESH JUPITER HOSPITAL
                            </span>
                        </div>

                        <button
                            type="button"
                            aria-label="Toggle Menu"
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen((v) => !v)}
                            className="interactive-target inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-700 lg:hidden"
                        >
                            {!mobileMenuOpen ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="border-t border-slate-200 bg-white/95 px-4 pb-4 pt-2 backdrop-blur-lg lg:hidden">
                        <div className="mb-3 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-2 sm:hidden">
                            <span className="vital-ping h-2 w-2 rounded-full bg-red-500" />
                            <span className="font-mono text-[10px] font-semibold tracking-wider text-teal-900">
                                ACTIVE // VISHESH JUPITER HOSPITAL
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                ["#hero", "01 Overview"],
                                ["#equipment-lab", "02 Equipment Lab"],
                                ["#experience", "03 Experience"],
                                ["#projects", "04 Projects"],
                                ["#education", "05 Education"],
                                ["#contact", "06 Contact"],
                            ].map(([href, label]) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* ==================================================================
            SECTION 1 — HERO ("LIVE VITALS" CONSOLE)
           ================================================================== */}
                <section id="hero" className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden py-12 sm:py-16 lg:py-20">
                    <canvas ref={heroBgCanvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-55" aria-hidden="true" />
                    <div className="pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 bottom-12 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

                    <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
                        {/* Left Column */}
                        <div className="lg:col-span-6">
                            <div className="hero-stagger mb-5 inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md">
                                <span className="h-2 w-2 rounded-full bg-teal-600" />
                                <span className="font-mono text-xs font-semibold tracking-widest text-slate-700">
                                    BIOMEDICAL ENGINEER • INDORE, INDIA
                                </span>
                            </div>

                            <h1 className="hero-stagger text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                Suhani{" "}
                                <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
                                    Johare
                                </span>
                            </h1>

                            <div className="hero-stagger mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500">
                                <span className="rounded-md border border-slate-200 bg-white/80 px-2.5 py-1">
                                    B.TECH BIOMEDICAL (SGSITS)
                                </span>
                                <span className="rounded-md border border-teal-200/80 bg-teal-50/70 px-2.5 py-1 text-teal-800">
                                    PYTHON • MATLAB • AI/ML
                                </span>
                            </div>

                            <p className="hero-stagger mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                Biomedical Engineer with experience in Machine Learning, Web Development, and Medical Image Processing. Skilled in Python, MATLAB, and AI/ML, with practical exposure to hospital-based biomedical applications. Passionate about using technology to solve real-world problems.
                            </p>

                            <div className="hero-stagger mt-8 flex flex-wrap items-center gap-4">
                                <a
                                    href="/Suhani-Johare-Resume.pdf"
                                    download="Suhani-Johare-Resume.pdf"
                                    onClick={() => showToast("DOWNLOADING // SUHANI JOHARE RESUME.PDF")}
                                    className="interactive-target group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-clinical transition-all hover:-translate-y-0.5 hover:shadow-glow-teal"
                                >
                                    <span>Download Resume</span>
                                    <svg
                                        className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href="#contact"
                                    className="interactive-target inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-700"
                                >
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    <span>Connect</span>
                                </a>
                            </div>

                            <div className="hero-stagger mt-10 grid grid-cols-3 gap-3 sm:max-w-lg">
                                <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm">
                                    <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Hospital Role</div>
                                    <div className="mt-1 text-sm font-bold text-slate-900">Biomedical Eng.</div>
                                    <div className="font-mono text-[10px] text-teal-600">Vishesh Jupiter</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm">
                                    <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Core Focus</div>
                                    <div className="mt-1 text-sm font-bold text-slate-900">PM &amp; Calibration</div>
                                    <div className="font-mono text-[10px] text-sky-600">Life-Support Gear</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm">
                                    <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tech Stack</div>
                                    <div className="mt-1 text-sm font-bold text-slate-900">AI &amp; Imaging</div>
                                    <div className="font-mono text-[10px] text-teal-600">MATLAB / Python</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bright White Interactive Multiparameter Patient Monitor */}
                        <div className="hero-stagger lg:col-span-6">
                            <div className="corner-marks relative mx-auto max-w-xl rounded-[28px] border-2 border-slate-200/90 bg-gradient-to-b from-white via-slate-50 to-slate-100/90 p-4 shadow-clinical-lg sm:p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600/10 text-teal-700">
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="font-mono text-[11px] font-bold tracking-wider text-slate-800">
                                                BIO-MON X7 // MULTIPARAMETER
                                            </div>
                                            <div className="font-mono text-[10px] text-teal-600">
                                                {currentMonitorCfg.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                                            25 mm/s
                                        </span>
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor: currentMonitorCfg.ledColor,
                                                boxShadow: `0 0 12px ${currentMonitorCfg.ledColor}`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Bright Clinical Diagnostic Screen */}
                                <div className="monitor-grid-bg relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-inner sm:p-4">
                                    {/* Channel 1: ECG Lead II */}
                                    <div className="mb-3 grid grid-cols-12 items-center gap-2 border-b border-slate-100 pb-2.5">
                                        <div className="col-span-8 sm:col-span-9">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="font-mono text-[10px] font-bold tracking-wider text-teal-700">II • ECG LEAD II</span>
                                                <span className="font-mono text-[10px] text-slate-400">1.0 mV</span>
                                            </div>
                                            <div className="relative h-16 w-full">
                                                <canvas ref={ecgCanvasRef} className="h-full w-full" />
                                            </div>
                                        </div>
                                        <div className="col-span-4 rounded-xl border border-teal-100 bg-teal-50/50 p-2 text-right sm:col-span-3">
                                            <div className="flex items-center justify-end gap-1 font-mono text-[10px] font-semibold text-teal-700">
                                                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" /> HR
                                            </div>
                                            <div className="font-mono text-2xl font-extrabold leading-none text-teal-700 sm:text-3xl">
                                                {currentMonitorCfg.hr}
                                            </div>
                                            <div className="font-mono text-[9px] text-slate-400">BPM</div>
                                        </div>
                                    </div>

                                    {/* Channel 2: SpO2 Pleth */}
                                    <div className="mb-3 grid grid-cols-12 items-center gap-2 border-b border-slate-100 pb-2.5">
                                        <div className="col-span-8 sm:col-span-9">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="font-mono text-[10px] font-bold tracking-wider text-sky-700">PLETH • SpO2 OPTICAL</span>
                                                <span className="font-mono text-[10px] text-slate-400">PI 4.2%</span>
                                            </div>
                                            <div className="relative h-14 w-full">
                                                <canvas ref={spo2CanvasRef} className="h-full w-full" />
                                            </div>
                                        </div>
                                        <div className="col-span-4 rounded-xl border border-sky-100 bg-sky-50/60 p-2 text-right sm:col-span-3">
                                            <div className="font-mono text-[10px] font-semibold text-sky-700">SpO2</div>
                                            <div className="font-mono text-2xl font-extrabold leading-none text-sky-700 sm:text-3xl">
                                                {currentMonitorCfg.spo2}
                                            </div>
                                            <div className="font-mono text-[9px] text-slate-400">% SAT</div>
                                        </div>
                                    </div>

                                    {/* Channel 3: Respiration Wave */}
                                    <div className="grid grid-cols-12 items-center gap-2">
                                        <div className="col-span-8 sm:col-span-9">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="font-mono text-[10px] font-bold tracking-wider text-slate-600">RESP • IMPEDANCE</span>
                                                <span className="font-mono text-[10px] text-slate-400">x1.0</span>
                                            </div>
                                            <div className="relative h-12 w-full">
                                                <canvas ref={respCanvasRef} className="h-full w-full" />
                                            </div>
                                        </div>
                                        <div className="col-span-4 rounded-xl border border-slate-200 bg-slate-50 p-2 text-right sm:col-span-3">
                                            <div className="font-mono text-[10px] font-semibold text-slate-600">RESP</div>
                                            <div className="font-mono text-2xl font-extrabold leading-none text-slate-800 sm:text-3xl">
                                                {currentMonitorCfg.resp}
                                            </div>
                                            <div className="font-mono text-[9px] text-slate-400">RPM</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Switcher Controls */}
                                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Patient Monitor Mode Switcher">
                                        {(
                                            [
                                                ["normal", "[NORMAL SINUS]"],
                                                ["calibration", "[CALIBRATION MODE]"],
                                                ["diagnostic", "[DIAGNOSTIC CHECK]"],
                                            ] as const
                                        ).map(([modeKey, label]) => {
                                            const active = monitorMode === modeKey;
                                            return (
                                                <button
                                                    key={modeKey}
                                                    type="button"
                                                    onClick={() => setMonitorMode(modeKey)}
                                                    className={
                                                        active
                                                            ? "interactive-target rounded-xl border border-teal-600 bg-teal-600 px-3 py-2 font-mono text-[10px] font-bold tracking-wider text-white shadow-sm transition-all"
                                                            : "interactive-target rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-[10px] font-bold tracking-wider text-slate-600 transition-all hover:border-sky-400 hover:text-sky-700"
                                                    }
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="font-mono text-[10px] font-medium text-slate-400">
                                        {monitorClock}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================================
            SECTION 2 — SCROLL-SCRUBBED "EXPLODED VIEW" MEDICAL EQUIPMENT
           ================================================================== */}
                <section id="equipment-lab" className="relative border-y border-slate-200/80 bg-white/60">
                    <div id="exploded-pin-wrapper" className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:min-h-[calc(100vh-64px)] lg:flex lg:flex-col lg:justify-center lg:px-8">
                        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-teal-800">
                                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                                    CLINICAL OPERATIONS // HARDWARE PRECISION
                                </div>
                                <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    Life-Support &amp; Diagnostic <span className="text-teal-600">Exploded Assembly</span>
                                </h2>
                                <p className="mt-1 font-mono text-xs font-medium text-slate-500">
                                    Vishesh Jupiter Hospital, Indore &bull; Biomedical Engineer (Aug 2026 – Present)
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Inspect Equipment Layers">
                                {LAYER_TABS.map((label, idx) => {
                                    const active = activeLayerIdx === idx;
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => inspectLayerByClick(idx)}
                                            className={
                                                active
                                                    ? "interactive-target rounded-xl border border-teal-600 bg-teal-600 px-3 py-1.5 font-mono text-[11px] font-semibold text-white shadow-sm transition-all"
                                                    : "interactive-target rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-600 transition-all hover:border-teal-300 hover:text-teal-700"
                                            }
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
                            {/* Left: 3D Multi-Layered ICU Assembly */}
                            <div
                                id="exploded-stage-card"
                                className="relative flex h-[460px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-5 shadow-clinical lg:col-span-6 lg:h-[520px]"
                            >
                                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                                    <span>UNIT: ICU-VENT / MON-ASSEMBLY</span>
                                    <span ref={explosionReadoutRef} className="rounded-md bg-teal-50 px-2.5 py-0.5 font-semibold text-teal-700">
                                        EXPLOSION: 0%
                                    </span>
                                </div>

                                <div className="relative flex flex-1 w-full items-center justify-center">
                                    {/* LAYER 1 CARRIER: Front Sterile Housing (Top, z-index: 40) */}
                                    <div
                                        ref={(el) => { carrierRefs.current[0] = el; }}
                                        className="layer-carrier-0 pointer-events-none absolute inset-x-0 z-40 flex items-center justify-center will-change-transform"
                                    >
                                        <div className="relative flex w-full max-w-[440px] items-center justify-center">
                                            <div
                                                ref={(el) => { plateRefs.current[0] = el; }}
                                                onClick={() => inspectLayerByClick(0)}
                                                className={`equip-layer interactive-target pointer-events-auto w-[270px] sm:w-[310px] cursor-pointer rounded-2xl border-2 border-slate-200 bg-white/95 p-2.5 shadow-2xl transition-shadow ${activeLayerIdx === 0 ? "is-focused opacity-100" : "opacity-90"
                                                    }`}
                                            >
                                                <svg viewBox="0 0 360 280" className="h-full w-full" fill="none">
                                                    <rect x="8" y="8" width="344" height="264" rx="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                                                    <rect x="24" y="32" width="248" height="195" rx="12" fill="#F8FAFC" stroke="#0D9488" strokeWidth="2" />
                                                    <rect x="24" y="32" width="248" height="26" rx="10" fill="#0F172A" />
                                                    <text x="36" y="49" fill="#5EEAD4" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">ICU LIFE-SUPPORT • CAL VERIFIED</text>
                                                    <path d="M 38 102 H 75 L 86 72 L 96 125 L 106 102 H 150 L 161 72 L 171 125 L 181 102 H 255" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M 38 165 Q 65 130 92 165 T 146 165 T 200 165 T 254 165" stroke="#0284C7" strokeWidth="2.2" />
                                                    <rect x="288" y="38" width="48" height="16" rx="8" fill="#EF4444" />
                                                    <circle cx="312" cy="112" r="22" fill="#F1F5F9" stroke="#64748B" strokeWidth="2.5" />
                                                    <circle cx="312" cy="112" r="12" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.8" />
                                                    <rect x="292" y="156" width="40" height="18" rx="6" fill="#E2E8F0" />
                                                    <rect x="292" y="182" width="40" height="18" rx="6" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.2" />
                                                    <text x="32" y="250" fill="#334155" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">FRONT STERILE HOUSING // IPX4</text>
                                                </svg>
                                            </div>

                                            {/* Attached Callout Pill & Leader Tick - Carrier 0 (Right) */}
                                            <div
                                                className={`pointer-events-auto absolute right-0 sm:right-2 flex items-center gap-1.5 transition-opacity duration-300 ${activeLayerIdx === 0 ? "opacity-100" : "opacity-40 hover:opacity-80"
                                                    }`}
                                            >
                                                <div className="h-[1px] w-5 sm:w-8 border-t border-dashed border-teal-500" />
                                                <button
                                                    type="button"
                                                    onClick={() => inspectLayerByClick(0)}
                                                    className="rounded-md border border-teal-500/40 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-bold text-teal-700 shadow-sm backdrop-blur-sm"
                                                >
                                                    L1 // CLINICAL UI
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LAYER 2 CARRIER: Signal Acquisition & Sensor PCB (z-index: 30) */}
                                    <div
                                        ref={(el) => { carrierRefs.current[1] = el; }}
                                        className="layer-carrier-1 pointer-events-none absolute inset-x-0 z-30 flex items-center justify-center will-change-transform"
                                    >
                                        <div className="relative flex w-full max-w-[440px] items-center justify-center">
                                            {/* Attached Callout Pill & Leader Tick - Carrier 1 (Left) */}
                                            <div
                                                className={`pointer-events-auto absolute left-0 sm:left-2 flex items-center gap-1.5 transition-opacity duration-300 ${activeLayerIdx === 1 ? "opacity-100" : "opacity-40 hover:opacity-80"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => inspectLayerByClick(1)}
                                                    className="rounded-md border border-sky-500/40 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-bold text-sky-700 shadow-sm backdrop-blur-sm"
                                                >
                                                    L2 // SENSOR PCB
                                                </button>
                                                <div className="h-[1px] w-5 sm:w-8 border-t border-dashed border-sky-500" />
                                            </div>

                                            <div
                                                ref={(el) => { plateRefs.current[1] = el; }}
                                                onClick={() => inspectLayerByClick(1)}
                                                className={`equip-layer interactive-target pointer-events-auto w-[270px] sm:w-[310px] cursor-pointer rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50/95 to-teal-50/90 p-2.5 shadow-xl transition-shadow ${activeLayerIdx === 1 ? "is-focused opacity-100" : "opacity-90"
                                                    }`}
                                            >
                                                <svg viewBox="0 0 360 280" className="h-full w-full" fill="none">
                                                    <rect x="12" y="12" width="336" height="256" rx="16" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2" />
                                                    <path d="M 45 70 H 125 V 115 H 165" stroke="#0284C7" strokeWidth="2" />
                                                    <path d="M 45 110 H 110 V 140 H 165" stroke="#0D9488" strokeWidth="2" />
                                                    <path d="M 225 120 H 285 V 70 H 315" stroke="#0284C7" strokeWidth="2" />
                                                    <path d="M 225 160 H 295 V 210" stroke="#0D9488" strokeWidth="2" />
                                                    <path d="M 180 185 V 230 H 95" stroke="#0D9488" strokeWidth="2" />
                                                    <rect x="150" y="95" width="82" height="82" rx="10" fill="#0F172A" stroke="#0284C7" strokeWidth="2.5" />
                                                    <rect x="164" y="109" width="54" height="54" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" />
                                                    <text x="167" y="140" fill="#38BDF8" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">MCU-DSP</text>
                                                    <rect x="35" y="45" width="65" height="40" rx="6" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.8" />
                                                    <text x="44" y="69" fill="#0F766E" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">ECG-AFE</text>
                                                    <rect x="260" y="190" width="68" height="46" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
                                                    <text x="268" y="216" fill="#0369A1" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">PRESS-IC</text>
                                                    <circle cx="60" cy="215" r="5" fill="#0D9488" />
                                                    <circle cx="80" cy="215" r="5" fill="#0284C7" />
                                                    <circle cx="100" cy="215" r="5" fill="#EF4444" />
                                                    <text x="38" y="245" fill="#0369A1" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">SIGNAL ACQUISITION &amp; SENSOR PCB</text>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LAYER 3 CARRIER: Pneumatic Flow Manifold (z-index: 20) */}
                                    <div
                                        ref={(el) => { carrierRefs.current[2] = el; }}
                                        className="layer-carrier-2 pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center will-change-transform"
                                    >
                                        <div className="relative flex w-full max-w-[440px] items-center justify-center">
                                            <div
                                                ref={(el) => { plateRefs.current[2] = el; }}
                                                onClick={() => inspectLayerByClick(2)}
                                                className={`equip-layer interactive-target pointer-events-auto w-[270px] sm:w-[310px] cursor-pointer rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-white/95 to-teal-50/90 p-2.5 shadow-xl transition-shadow ${activeLayerIdx === 2 ? "is-focused opacity-100" : "opacity-90"
                                                    }`}
                                            >
                                                <svg viewBox="0 0 360 280" className="h-full w-full" fill="none">
                                                    <rect x="12" y="12" width="336" height="256" rx="16" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.8" strokeDasharray="6 4" />
                                                    <rect x="40" y="55" width="280" height="44" rx="12" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2" />
                                                    <path d="M 60 77 L 300 77" stroke="#0D9488" strokeWidth="3" strokeDasharray="10 6" />
                                                    <rect x="65" y="125" width="60" height="86" rx="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
                                                    <circle cx="95" cy="155" r="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
                                                    <text x="73" y="198" fill="#0369A1" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">O2 VALV</text>
                                                    <rect x="150" y="125" width="60" height="86" rx="10" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
                                                    <circle cx="180" cy="155" r="14" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
                                                    <text x="158" y="198" fill="#0F766E" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">FLOW-S</text>
                                                    <rect x="235" y="125" width="60" height="86" rx="10" fill="#F1F5F9" stroke="#475569" strokeWidth="2" />
                                                    <circle cx="265" cy="155" r="14" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
                                                    <text x="242" y="198" fill="#334155" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">PEEP-V</text>
                                                    <text x="45" y="244" fill="#0F766E" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">PNEUMATIC FLOW MANIFOLD // 45 PSI</text>
                                                </svg>
                                            </div>

                                            {/* Attached Callout Pill & Leader Tick - Carrier 2 (Right) */}
                                            <div
                                                className={`pointer-events-auto absolute right-0 sm:right-2 flex items-center gap-1.5 transition-opacity duration-300 ${activeLayerIdx === 2 ? "opacity-100" : "opacity-40 hover:opacity-80"
                                                    }`}
                                            >
                                                <div className="h-[1px] w-5 sm:w-8 border-t border-dashed border-teal-500" />
                                                <button
                                                    type="button"
                                                    onClick={() => inspectLayerByClick(2)}
                                                    className="rounded-md border border-teal-500/40 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-bold text-teal-700 shadow-sm backdrop-blur-sm"
                                                >
                                                    L3 // PNEUMATIC
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LAYER 4 CARRIER: ISO-60601 PSU (Bottom, z-index: 10) */}
                                    <div
                                        ref={(el) => { carrierRefs.current[3] = el; }}
                                        className="layer-carrier-3 pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center will-change-transform"
                                    >
                                        <div className="relative flex w-full max-w-[440px] items-center justify-center">
                                            {/* Attached Callout Pill & Leader Tick - Carrier 3 (Left) */}
                                            <div
                                                className={`pointer-events-auto absolute left-0 sm:left-2 flex items-center gap-1.5 transition-opacity duration-300 ${activeLayerIdx === 3 ? "opacity-100" : "opacity-40 hover:opacity-80"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => inspectLayerByClick(3)}
                                                    className="rounded-md border border-rose-500/40 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-700 shadow-sm backdrop-blur-sm"
                                                >
                                                    L4 // ISOLATED PSU
                                                </button>
                                                <div className="h-[1px] w-5 sm:w-8 border-t border-dashed border-rose-500" />
                                            </div>

                                            <div
                                                ref={(el) => { plateRefs.current[3] = el; }}
                                                onClick={() => inspectLayerByClick(3)}
                                                className={`equip-layer interactive-target pointer-events-auto w-[270px] sm:w-[310px] cursor-pointer rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200/90 p-2.5 shadow-xl transition-shadow ${activeLayerIdx === 3 ? "is-focused opacity-100" : "opacity-90"
                                                    }`}
                                            >
                                                <svg viewBox="0 0 360 280" className="h-full w-full" fill="none">
                                                    <rect x="10" y="10" width="340" height="260" rx="16" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
                                                    <circle cx="105" cy="135" r="52" fill="#E2E8F0" stroke="#475569" strokeWidth="2.5" />
                                                    <circle cx="105" cy="135" r="24" fill="#F8FAFC" stroke="#0D9488" strokeWidth="2" strokeDasharray="5 3" />
                                                    <text x="72" y="210" fill="#334155" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">ISO-60601 PSU</text>
                                                    <rect x="190" y="45" width="130" height="75" rx="10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
                                                    <circle cx="220" cy="82" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                                                    <circle cx="256" cy="82" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                                                    <circle cx="292" cy="82" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                                                    <rect x="190" y="140" width="130" height="88" rx="10" fill="#FEF2F2" stroke="#EF4444" strokeWidth="1.6" />
                                                    <line x1="255" y1="158" x2="255" y2="180" stroke="#EF4444" strokeWidth="2.5" />
                                                    <line x1="237" y1="180" x2="273" y2="180" stroke="#EF4444" strokeWidth="2.5" />
                                                    <line x1="243" y1="188" x2="267" y2="188" stroke="#EF4444" strokeWidth="2.2" />
                                                    <line x1="249" y1="196" x2="261" y2="196" stroke="#EF4444" strokeWidth="2" />
                                                    <text x="206" y="215" fill="#B91C1C" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">LEAKAGE &lt;10uA</text>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] font-semibold text-slate-400">ASSEMBLED</span>
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            ref={explosionBarRef}
                                            id="explosion-progress-bar"
                                            className="h-full w-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 will-change-transform"
                                            style={{ transformOrigin: "left center", transform: "scaleX(0)" }}
                                        />
                                    </div>
                                    <span className="font-mono text-[10px] font-semibold text-teal-700">EXPLODED</span>
                                </div>
                            </div>

                            {/* Right: 4 Hospital Responsibilities */}
                            <div className="space-y-2.5 lg:col-span-6">
                                {RESP_CARDS.map((card, idx) => {
                                    const isActive = activeLayerIdx === idx;
                                    return (
                                        <article
                                            key={card.num}
                                            onClick={() => inspectLayerByClick(idx)}
                                            className={`interactive-target cursor-pointer rounded-2xl p-3.5 sm:p-4 transition-all duration-300 ${isActive
                                                ? "border-2 border-teal-500 bg-white opacity-100 shadow-clinical"
                                                : "border border-slate-200 bg-white/80 opacity-75 hover:opacity-100"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-[11px] font-bold ${isActive ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        {card.num}
                                                    </span>
                                                    <div>
                                                        <div className={`font-mono text-[9px] font-semibold uppercase tracking-wider ${card.layerColor}`}>
                                                            {card.layerLabel}
                                                        </div>
                                                        <h3 className="text-sm sm:text-base font-bold leading-snug text-slate-900">{card.title}</h3>
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${card.badgeClass}`}>
                                                    {card.badge}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">{card.desc}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================================
            SECTION 3 — DIAGNOSTIC X-RAY SCANNING TIMELINE
           ================================================================== */}
                <section id="experience" className="relative overflow-hidden py-20 sm:py-24">
                    {/* Parallax Medical Vector Props */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                        <svg className="parallax-prop absolute -left-8 top-24 h-56 w-56 text-teal-600/[0.07]" data-speed="-35" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M30 20 V45 C30 62 44 74 60 74 C76 74 90 62 90 45 V20" strokeLinecap="round" />
                            <path d="M60 74 V92 C60 104 72 110 84 106 C96 102 100 90 96 80" strokeLinecap="round" />
                            <circle cx="96" cy="76" r="8" />
                            <circle cx="30" cy="18" r="4" />
                            <circle cx="90" cy="18" r="4" />
                        </svg>
                        <svg className="parallax-prop absolute right-6 top-1/3 h-64 w-64 text-sky-600/[0.07]" data-speed="45" viewBox="0 0 140 140" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="20" y="30" width="100" height="72" rx="12" />
                            <rect x="32" y="42" width="48" height="28" rx="4" />
                            <polyline points="36,56 46,56 50,48 55,64 60,56 75,56" />
                            <line x1="25" y1="88" x2="115" y2="88" strokeDasharray="6 4" />
                            <circle cx="100" cy="56" r="10" />
                        </svg>
                        <svg className="parallax-prop absolute bottom-16 left-12 h-48 w-48 text-slate-600/[0.07]" data-speed="-25" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M22 98 L40 80 M35 75 L75 35 L85 45 L45 85 Z" />
                            <line x1="70" y1="30" x2="90" y2="50" />
                            <line x1="80" y1="40" x2="98" y2="22" />
                            <line x1="90" y1="14" x2="106" y2="30" />
                        </svg>
                    </div>

                    <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-14 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-sky-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                                DIAGNOSTIC X-RAY SCAN // CLINICAL TRAJECTORY
                            </div>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Experience, Internships &amp; <span className="text-teal-600">Trainings</span>
                            </h2>
                            <p className="mx-auto mt-2.5 max-w-2xl text-sm text-slate-600 sm:text-base">
                                Scroll through the timeline as the surgical diagnostic scanner glides down to illuminate technical specifications and hospital contributions.
                            </p>
                        </div>

                        <div ref={timelineContainerRef} className="relative">
                            <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-slate-200 md:left-1/2 md:-translate-x-1/2" />
                            <div ref={spineFillRef} className="absolute left-5 top-0 w-0.5 bg-gradient-to-b from-teal-500 to-sky-500 md:left-1/2 md:-translate-x-1/2" style={{ height: "0%" }} />

                            <div
                                ref={scannerBeamRef}
                                className="scanner-beam pointer-events-none absolute left-0 right-0 z-20 flex h-12 -translate-y-1/2 items-center justify-between rounded-full border-y border-teal-400/50 px-4 opacity-90"
                                style={{ top: "6%" }}
                            >
                                <span className="rounded bg-teal-700 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-white">X-RAY SCAN</span>
                                <div className="mx-3 h-[1.5px] flex-1 bg-gradient-to-r from-teal-400 via-sky-500 to-teal-400" />
                                <span ref={depthReadoutRef} className="rounded bg-white/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-teal-800 shadow-sm">000 mm</span>
                            </div>

                            <div className="space-y-10">
                                {/* Entry 1 */}
                                <div className="xray-item relative pl-14 md:grid md:grid-cols-2 md:gap-10 md:pl-0">
                                    <div className="absolute left-3 top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-teal-600 bg-white md:left-1/2 md:-translate-x-1/2">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                    </div>
                                    <div className="md:pr-6 md:text-right">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-xs font-bold text-teal-800">
                                            Aug 2026 – Present
                                        </span>
                                        <p className="mt-2 hidden font-mono text-[11px] text-slate-400 md:block">FULL-TIME CLINICAL ROLE</p>
                                    </div>
                                    <article className="timeline-card clinical-card corner-marks mt-2 rounded-2xl p-6 md:mt-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="text-lg font-extrabold text-slate-900">Biomedical Engineer</h3>
                                            <span className="rounded-md bg-red-50 px-2 py-0.5 font-mono text-[10px] font-bold text-red-600">ACTIVE</span>
                                        </div>
                                        <p className="mt-0.5 text-sm font-semibold text-teal-700">Vishesh Jupiter Hospital, Indore</p>
                                        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                                            <li>&bull; Preventive maintenance, calibration, and electrical safety inspections on diagnostic, monitoring, and life-support equipment.</li>
                                            <li>&bull; Rapid breakdown troubleshooting to minimize clinical downtime and support uninterrupted patient care.</li>
                                            <li>&bull; Equipment inventory, service histories, AMC/CMC records, compliance documentation, vendor coordination &amp; staff guidance.</li>
                                        </ul>
                                        <div className="xray-spec-reveal mt-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 font-mono text-[10px] font-semibold text-teal-800">
                                            <span>#PM_CALIBRATION</span>
                                            <span>#ELECTRICAL_SAFETY</span>
                                            <span>#AMC_CMC</span>
                                            <span>#LIFE_SUPPORT</span>
                                        </div>
                                    </article>
                                </div>

                                {/* Entry 2 */}
                                <div className="xray-item relative pl-14 md:grid md:grid-cols-2 md:gap-10 md:pl-0">
                                    <div className="absolute left-3 top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-sky-600 bg-white md:left-1/2 md:-translate-x-1/2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                                    </div>
                                    <article className="timeline-card clinical-card corner-marks order-2 mt-2 rounded-2xl p-6 md:order-1 md:mt-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="text-lg font-extrabold text-slate-900">AI &amp; Machine Learning Internship</h3>
                                            <span className="rounded-md bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-700">INTERNSHIP</span>
                                        </div>
                                        <p className="mt-0.5 text-sm font-semibold text-sky-700">YBI Foundation</p>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                            Developed a Movie Recommendation System using Python, Pandas, and Scikit-Learn on real-world datasets, building feature similarity pipelines and model evaluation workflows.
                                        </p>
                                        <div className="xray-spec-reveal mt-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 font-mono text-[10px] font-semibold text-sky-800">
                                            <span>#PYTHON</span>
                                            <span>#PANDAS</span>
                                            <span>#SCIKIT_LEARN</span>
                                            <span>#ML_PIPELINES</span>
                                        </div>
                                    </article>
                                    <div className="order-1 md:order-2 md:pl-6">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-xs font-bold text-sky-800">
                                            May – June 2024
                                        </span>
                                        <p className="mt-2 hidden font-mono text-[11px] text-slate-400 md:block">DATA SCIENCE &amp; ML TRACK</p>
                                    </div>
                                </div>

                                {/* Entry 3 */}
                                <div className="xray-item relative pl-14 md:grid md:grid-cols-2 md:gap-10 md:pl-0">
                                    <div className="absolute left-3 top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-teal-600 bg-white md:left-1/2 md:-translate-x-1/2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                                    </div>
                                    <div className="md:pr-6 md:text-right">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-xs font-bold text-teal-800">
                                            June – July 2023
                                        </span>
                                        <p className="mt-2 hidden font-mono text-[11px] text-slate-400 md:block">CLINICAL IMMERSION</p>
                                    </div>
                                    <article className="timeline-card clinical-card corner-marks mt-2 rounded-2xl p-6 md:mt-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="text-lg font-extrabold text-slate-900">Hospital Training</h3>
                                            <span className="rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700">TRAINING</span>
                                        </div>
                                        <p className="mt-0.5 text-sm font-semibold text-teal-700">Vishesh Jupiter Hospital, Indore</p>
                                        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                                            <li>&bull; Assisted in Biomedical Department Administration &amp; Documentation.</li>
                                            <li>&bull; Gained hands-on exposure to Preventive Maintenance &amp; Calibration of medical equipment.</li>
                                            <li>&bull; Observed surgeries and learned about the Biomedical Engineer&apos;s role in hospital operations.</li>
                                        </ul>
                                        <div className="xray-spec-reveal mt-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 font-mono text-[10px] font-semibold text-teal-800">
                                            <span>#OT_OBSERVATION</span>
                                            <span>#BIOMED_ADMIN</span>
                                            <span>#CALIBRATION_EXPOSURE</span>
                                        </div>
                                    </article>
                                </div>

                                {/* Entry 4 */}
                                <div className="xray-item relative pl-14 md:grid md:grid-cols-2 md:gap-10 md:pl-0">
                                    <div className="absolute left-3 top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-500 bg-white md:left-1/2 md:-translate-x-1/2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                                    </div>
                                    <article className="timeline-card clinical-card corner-marks order-2 mt-2 rounded-2xl p-6 md:order-1 md:mt-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="text-lg font-extrabold text-slate-900">Care &amp; Maintenance Workshop</h3>
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">WORKSHOP</span>
                                        </div>
                                        <p className="mt-0.5 text-sm font-semibold text-slate-700">B. Braun Medical (India) Pvt. Ltd.</p>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                            Attended specialized medical equipment care and maintenance workshop focused on clinical infusion technology, sterile handling standards, and preventive service protocols.
                                        </p>
                                        <div className="xray-spec-reveal mt-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 font-mono text-[10px] font-semibold text-slate-700">
                                            <span>#B_BRAUN_MEDICAL</span>
                                            <span>#DEVICE_CARE</span>
                                            <span>#MAINTENANCE_PROTOCOL</span>
                                        </div>
                                    </article>
                                    <div className="order-1 md:order-2 md:pl-6">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-700">
                                            June 2023
                                        </span>
                                        <p className="mt-2 hidden font-mono text-[11px] text-slate-400 md:block">INDUSTRY CERTIFICATION</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================================
            SECTION 4 — INTERACTIVE "BIOMEDICAL & TECH LAB" PROJECTS
           ================================================================== */}
                <section id="projects" className="border-t border-slate-200/80 bg-white/55 py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-teal-800">
                                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                                    BIOMEDICAL &amp; TECH LAB // INTERACTIVE DEMOS
                                </div>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    Featured Engineering <span className="text-sky-600">Projects</span>
                                </h2>
                            </div>
                            <p className="max-w-md font-mono text-xs text-slate-500">
                                Hover, move, or tap directly inside each diagnostic instrument module to test live simulations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* PROJECT 1: VEIN DETECTOR */}
                            <article className="project-reveal clinical-card corner-marks flex flex-col justify-between rounded-3xl p-6 lg:col-span-7">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-[10px] font-bold text-teal-800">
                                            2023–2024 // MATLAB IMAGE PROCESSING
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-400">Mentor: Mr. Sunny Ganavdiya</span>
                                    </div>
                                    <h3 className="mt-3 text-2xl font-extrabold text-slate-900">Vein Detector</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Created a Vein Detector using MATLAB Image Processing aimed at improving medical procedures like venipuncture, IV insertion, and blood draws through contrast-enhanced sub-dermal vascular mapping.
                                    </p>
                                </div>

                                <div
                                    className="interactive-target relative mt-5 select-none overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/90 p-4"
                                    style={{ touchAction: "none" }}
                                >
                                    <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                                        <span className="font-bold text-teal-700">NIR OPTICAL SCANNER // 850nm</span>
                                        <span ref={veinCoordsRef} className="rounded bg-white px-2 py-0.5 text-slate-500 shadow-sm">
                                            AUTO-SWEEP • MOVE CURSOR TO SCAN
                                        </span>
                                    </div>

                                    <svg ref={veinSvgRef} viewBox="0 0 520 190" className="h-44 w-full cursor-crosshair sm:h-48">
                                        <defs>
                                            <clipPath id="nir-lens-clip">
                                                <circle ref={nirClipCircleRef} cx="240" cy="95" r="56" />
                                            </clipPath>
                                            <filter id="vein-glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        <g stroke="#CBD5E1" strokeWidth="1">
                                            <line x1="20" y1="175" x2="500" y2="175" />
                                            <line x1="60" y1="170" x2="60" y2="180" />
                                            <line x1="160" y1="170" x2="160" y2="180" />
                                            <line x1="260" y1="170" x2="260" y2="180" />
                                            <line x1="360" y1="170" x2="360" y2="180" />
                                            <line x1="460" y1="170" x2="460" y2="180" />
                                        </g>

                                        <path
                                            d="M 20 55 C 120 48, 250 56, 365 66 C 405 69, 430 62, 468 65 C 488 67, 495 82, 480 90 C 495 96, 492 112, 474 114 C 482 124, 472 135, 452 134 C 415 132, 385 128, 355 130 C 245 138, 125 148, 20 140 Z"
                                            fill="#FFF7ED"
                                            stroke="#CBD5E1"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M 25 65 C 150 60, 275 68, 375 76"
                                            stroke="#FED7AA"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            fill="none"
                                            opacity="0.6"
                                        />

                                        <g clipPath="url(#nir-lens-clip)">
                                            <rect x="0" y="0" width="520" height="190" fill="#042F2E" opacity="0.92" />
                                            <path
                                                d="M 20 55 C 120 48, 250 56, 365 66 C 405 69, 430 62, 468 65 C 488 67, 495 82, 480 90 C 495 96, 492 112, 474 114 C 482 124, 472 135, 452 134 C 415 132, 385 128, 355 130 C 245 138, 125 148, 20 140 Z"
                                                fill="#115E59"
                                                opacity="0.55"
                                            />
                                            <g filter="url(#vein-glow)" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M 30 78 Q 110 70 185 84 T 330 82 T 445 86" stroke="#2DD4BF" strokeWidth="4.2" />
                                                <path d="M 30 124 Q 120 130 205 112 T 345 116 T 450 108" stroke="#14B8A6" strokeWidth="3.8" />
                                                <path d="M 118 76 Q 158 98 205 112" stroke="#5EEAD4" strokeWidth="3.2" />
                                                <path d="M 238 86 Q 275 102 315 115" stroke="#5EEAD4" strokeWidth="2.6" />
                                                <path d="M 185 84 Q 210 68 250 67" stroke="#99F6E4" strokeWidth="1.8" />
                                                <path d="M 290 83 Q 315 72 355 74" stroke="#99F6E4" strokeWidth="1.6" />
                                                <path d="M 165 122 Q 200 132 245 128" stroke="#99F6E4" strokeWidth="1.7" />
                                                <path d="M 365 84 Q 395 96 420 98" stroke="#5EEAD4" strokeWidth="2" />
                                                <circle cx="205" cy="112" r="7" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
                                            </g>
                                        </g>

                                        <g ref={nirLensRingRef} transform="translate(240, 95)" className="pointer-events-none">
                                            <circle cx="0" cy="0" r="56" fill="none" stroke="#0D9488" strokeWidth="2.4" />
                                            <circle cx="0" cy="0" r="61" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="6 5" opacity="0.7" />
                                            <line x1="-12" y1="0" x2="12" y2="0" stroke="#5EEAD4" strokeWidth="1.2" />
                                            <line x1="0" y1="-12" x2="0" y2="12" stroke="#5EEAD4" strokeWidth="1.2" />
                                            <text x="-28" y="-65" fill="#0F766E" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">NIR LENS</text>
                                        </g>
                                    </svg>
                                </div>
                            </article>

                            {/* PROJECT 2: RESCUE READY */}
                            <article className="project-reveal clinical-card corner-marks flex flex-col justify-between rounded-3xl p-6 lg:col-span-5">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-[10px] font-bold text-sky-800">
                                            2024–2025 // DJANGO WEB APP
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-400">Mentor: Mr. Vinay Manurkar</span>
                                    </div>
                                    <h3 className="mt-3 text-2xl font-extrabold text-slate-900">Rescue Ready</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Django-based hospital-ambulance coordination platform featuring role-based authentication, live ambulance GPS tracking, and real-time emergency updates.
                                    </p>
                                </div>

                                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-inner">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="vital-ping h-2 w-2 rounded-full bg-red-500" />
                                            <span ref={ambulanceStatusRef} className="font-mono text-[10px] font-bold text-slate-700">
                                                AMB-04 // EN ROUTE
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span ref={ambulanceEtaRef} className="rounded bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700">
                                                ETA 04m 12s
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setPriorityMode((v) => !v)}
                                                className={`interactive-target rounded-lg border px-2 py-0.5 font-mono text-[9px] font-bold transition-colors ${priorityMode
                                                    ? "border-red-600 bg-red-600 text-white"
                                                    : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white"
                                                    }`}
                                            >
                                                {priorityMode ? "SIREN ON" : "PRIORITY"}
                                            </button>
                                        </div>
                                    </div>

                                    <svg viewBox="0 0 360 190" className="h-44 w-full rounded-xl bg-slate-50/90 sm:h-48">
                                        <g stroke="#E2E8F0" strokeWidth="1.2">
                                            <line x1="0" y1="45" x2="360" y2="45" />
                                            <line x1="0" y1="95" x2="360" y2="95" />
                                            <line x1="0" y1="145" x2="360" y2="145" />
                                            <line x1="70" y1="0" x2="70" y2="190" />
                                            <line x1="150" y1="0" x2="150" y2="190" />
                                            <line x1="230" y1="0" x2="230" y2="190" />
                                            <line x1="300" y1="0" x2="300" y2="190" />
                                        </g>

                                        <circle cx="300" cy="45" r="24" fill="#0D9488" opacity="0.08" />
                                        <circle cx="300" cy="45" r="46" fill="none" stroke="#0D9488" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />

                                        <path
                                            ref={ambulanceRouteRef}
                                            d="M 42 145 L 150 145 L 150 95 L 230 95 L 230 45 L 300 45"
                                            fill="none"
                                            stroke="#0284C7"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeDasharray="7 5"
                                        />

                                        <circle cx="42" cy="145" r="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
                                        <text x="20" y="166" fill="#64748B" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700">PICKUP</text>

                                        <g transform="translate(300, 45)">
                                            <circle cx="0" cy="0" r="14" fill="#EF4444" opacity="0.18">
                                                <animate attributeName="r" values="10;22;10" dur="1.8s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="0.3;0;0.3" dur="1.8s" repeatCount="indefinite" />
                                            </circle>
                                            <rect x="-11" y="-11" width="22" height="22" rx="6" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
                                            <path d="M 0 -6 V 6 M -6 0 H 6" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
                                            <text x="-22" y="25" fill="#0F766E" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700">HOSPITAL</text>
                                        </g>

                                        <g ref={ambulanceUnitRef} transform="translate(42, 145)">
                                            <circle cx="0" cy="0" r="14" fill="#0284C7" opacity="0.16" />
                                            <rect x="-13" y="-9" width="26" height="18" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
                                            <rect x="6" y="-6" width="5" height="12" rx="1.5" fill="#BAE6FD" />
                                            <path d="M -4 -4 V 4 M -8 0 H 0" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
                                            <circle cx="2" cy="-9" r="2.2" fill="#EF4444">
                                                <animate attributeName="opacity" values="1;0.2;1" dur="0.45s" repeatCount="indefinite" />
                                            </circle>
                                        </g>
                                    </svg>
                                </div>
                            </article>

                            {/* PROJECT 3: MOTION DETECTOR */}
                            <article className="project-reveal clinical-card corner-marks flex flex-col justify-between rounded-3xl p-6 lg:col-span-6">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-[10px] font-bold text-slate-700">
                                            2022–2023 // PIR SENSOR &amp; IR RADIATION
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-400">Mentor: Dr. Anuj Rawat (EI Dept.)</span>
                                    </div>
                                    <h3 className="mt-3 text-2xl font-extrabold text-slate-900">Motion Detector</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Designed a Passive Infrared (PIR) sensor-based Motion Detector for security and automation utilizing Infrared (IR) radiation shifts for real-time motion detection and alert activation.
                                    </p>
                                </div>

                                <div className="interactive-target relative mt-5 select-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                                    <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                                        <span className="font-bold text-slate-700">HC-SR501 PIR FIELD // 120° FOV</span>
                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 font-bold transition-colors ${pirActive
                                                ? "border-red-300 bg-red-50 text-red-600"
                                                : "border-teal-200 bg-teal-50 text-teal-700"
                                                }`}
                                        >
                                            {pirActive ? "MOTION DETECTED // ALERT ACTIVE" : "STANDBY // NO IR SHIFT"}
                                        </span>
                                    </div>

                                    <svg
                                        ref={pirSvgRef}
                                        viewBox="0 0 420 175"
                                        className="h-40 w-full cursor-pointer"
                                        onMouseMove={(e) => handlePirPointer(e.clientX, e.clientY)}
                                        onMouseLeave={() => setPirActive(false)}
                                        onTouchStart={(e) => {
                                            if (e.touches[0]) handlePirPointer(e.touches[0].clientX, e.touches[0].clientY);
                                        }}
                                        onTouchMove={(e) => {
                                            if (e.touches[0]) handlePirPointer(e.touches[0].clientX, e.touches[0].clientY);
                                        }}
                                        onTouchEnd={() => {
                                            pirResetTimerRef.current = setTimeout(() => setPirActive(false), 900);
                                        }}
                                    >
                                        <path
                                            d="M 55 88 L 375 18 A 330 330 0 0 1 375 158 Z"
                                            fill={pirActive ? "rgba(239, 68, 68, 0.14)" : "rgba(13, 148, 136, 0.09)"}
                                            stroke={pirActive ? "#EF4444" : "#0D9488"}
                                            strokeWidth="1.4"
                                            strokeDasharray="5 4"
                                            className="transition-all duration-300"
                                        />
                                        <path d="M 155 66 A 102 102 0 0 1 155 110" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                                        <path d="M 255 44 A 205 205 0 0 1 255 132" fill="none" stroke="#CBD5E1" strokeWidth="1" />

                                        <g opacity={pirActive ? 1 : 0} className="transition-opacity duration-200">
                                            <circle cx="55" cy="88" r="24" fill="none" stroke="#EF4444" strokeWidth="2" className="pir-ring-active" />
                                            <circle cx="55" cy="88" r="42" fill="none" stroke="#EF4444" strokeWidth="1.5" className="pir-ring-active" style={{ animationDelay: "0.35s" }} />
                                        </g>

                                        <rect x="20" y="64" width="28" height="48" rx="6" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
                                        <path d="M 48 68 A 20 20 0 0 1 48 108 Z" fill="#E2E8F0" stroke="#0D9488" strokeWidth="2" />
                                        <circle cx="34" cy="88" r="4.5" fill={pirActive ? "#EF4444" : "#0D9488"} />

                                        <g transform={`translate(${pirTarget.x.toFixed(1)}, ${pirTarget.y.toFixed(1)})`} opacity={pirActive ? 1 : 0.45}>
                                            <circle cx="0" cy="0" r="11" fill="#EF4444" opacity="0.2" />
                                            <circle cx="0" cy="0" r="4.5" fill="#EF4444" />
                                            <text x="-38" y="24" fill="#64748B" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600">
                                                HOVER / TAP CONE
                                            </text>
                                        </g>
                                    </svg>
                                </div>
                            </article>

                            {/* PROJECT 4: MOVIE RECOMMENDATION SYSTEM */}
                            <article className="project-reveal clinical-card corner-marks flex flex-col justify-between rounded-3xl p-6 lg:col-span-6">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-[10px] font-bold text-sky-800">
                                            MAY–JUNE 2024 // PYTHON • PANDAS • SCIKIT-LEARN
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-400">YBI Foundation Internship</span>
                                    </div>
                                    <h3 className="mt-3 text-2xl font-extrabold text-slate-900">Movie Recommendation System</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Machine learning recommendation engine trained on real-world datasets using TF-IDF feature vectorization and cosine similarity matrices to rank high-affinity content matches.
                                    </p>
                                </div>

                                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
                                    <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                                        <span className="font-bold text-sky-700">COSINE SIMILARITY GRAPH</span>
                                        <span className="rounded bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                                            {currentMlNode.label} • {currentMlNode.score}
                                        </span>
                                    </div>

                                    <svg viewBox="0 0 420 175" className="h-40 w-full">
                                        <g>
                                            {ML_EDGES.map((edge) => {
                                                const connected = edge.a === activeMlNode || edge.b === activeMlNode;
                                                return (
                                                    <line
                                                        key={`${edge.a}-${edge.b}`}
                                                        x1={edge.x1}
                                                        y1={edge.y1}
                                                        x2={edge.x2}
                                                        y2={edge.y2}
                                                        stroke={connected ? "#0284C7" : "#CBD5E1"}
                                                        strokeWidth={connected ? 2.8 : 1.4}
                                                        strokeDasharray={edge.dashed ? "4 4" : undefined}
                                                    />
                                                );
                                            })}
                                        </g>

                                        {ML_NODES.map((node) => {
                                            const focused = activeMlNode === node.id;
                                            return (
                                                <g
                                                    key={node.id}
                                                    className="interactive-target cursor-pointer"
                                                    onClick={() => setActiveMlNode(node.id)}
                                                    onMouseEnter={() => setActiveMlNode(node.id)}
                                                >
                                                    <circle
                                                        cx={node.cx}
                                                        cy={node.cy}
                                                        r={node.r}
                                                        fill={node.fill}
                                                        stroke={focused ? "#EF4444" : node.stroke}
                                                        strokeWidth={focused ? 3 : 2}
                                                    />
                                                    <text
                                                        x={node.cx}
                                                        y={node.cy + 3}
                                                        textAnchor="middle"
                                                        fill={node.textColor}
                                                        fontFamily="JetBrains Mono"
                                                        fontSize={node.id === 0 ? 9 : node.id <= 2 ? 8.5 : 8}
                                                        fontWeight="700"
                                                    >
                                                        {node.text}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ==================================================================
            SECTION 5 — TECHNICAL SKILLS & CALIBRATION MATRIX
           ================================================================== */}
                <section id="skills" className="py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-teal-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                                INSTRUMENTATION SPECS // CALIBRATION MATRIX
                            </div>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Technical Skills &amp; <span className="text-teal-600">Core Competencies</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Biomedical Core */}
                            <div className="clinical-card corner-marks rounded-3xl p-6">
                                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                            </svg>
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Biomedical Core</h3>
                                            <p className="font-mono text-[10px] text-slate-400">CH-01 // HOSPITAL HARDWARE</p>
                                        </div>
                                    </div>
                                    <span className="rounded-md bg-teal-50 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-700">VERIFIED</span>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        ["Preventive Maintenance", "92%", "from-teal-500 to-teal-600"],
                                        ["Biomedical Instrumentation", "88%", "from-teal-500 to-sky-500"],
                                        ["Medical Image Processing", "85%", "from-teal-500 to-sky-500"],
                                        ["Calibration (Basic Exposure)", "78%", "from-teal-400 to-teal-600"],
                                    ].map(([name, pct, grad]) => (
                                        <div key={name}>
                                            <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700">
                                                <span>{name}</span>
                                                <span className="font-mono text-teal-700">{pct}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div className={`skill-fill h-full rounded-full bg-gradient-to-r ${grad}`} data-width={pct} style={{ width: "0%" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Programming & ML */}
                            <div className="clinical-card corner-marks rounded-3xl p-6">
                                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Programming &amp; ML</h3>
                                            <p className="font-mono text-[10px] text-slate-400">CH-02 // COMPUTE &amp; AI</p>
                                        </div>
                                    </div>
                                    <span className="rounded-md bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-700">ACTIVE</span>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        ["Python", "88%", "from-sky-500 to-sky-600"],
                                        ["MATLAB", "86%", "from-sky-500 to-teal-500"],
                                        ["Django (Web Development)", "82%", "from-sky-400 to-sky-600"],
                                        ["Pandas & Scikit-Learn", "84%", "from-teal-500 to-sky-600"],
                                    ].map(([name, pct, grad]) => (
                                        <div key={name}>
                                            <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700">
                                                <span>{name}</span>
                                                <span className="font-mono text-sky-700">{pct}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div className={`skill-fill h-full rounded-full bg-gradient-to-r ${grad}`} data-width={pct} style={{ width: "0%" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Systems & Languages */}
                            <div className="clinical-card corner-marks flex flex-col justify-between rounded-3xl p-6">
                                <div>
                                    <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Systems &amp; Languages</h3>
                                                <p className="font-mono text-[10px] text-slate-400">CH-03 // ENVIRONMENT</p>
                                            </div>
                                        </div>
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">READY</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 py-2 text-center">
                                        {[
                                            { label: "Windows", sub: "OS PROFICIENT", color: "#0D9488", target: "16" },
                                            { label: "English", sub: "FLUENT", color: "#0284C7", target: "12" },
                                            { label: "Hindi", sub: "NATIVE", color: "#0D9488", target: "6" },
                                        ].map((gauge) => (
                                            <div key={gauge.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                                                <svg className="mx-auto h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                                                    <circle cx="32" cy="32" r="26" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                                                    <circle
                                                        className="radial-gauge"
                                                        cx="32"
                                                        cy="32"
                                                        r="26"
                                                        fill="none"
                                                        stroke={gauge.color}
                                                        strokeWidth="5"
                                                        strokeLinecap="round"
                                                        strokeDasharray="163.36"
                                                        strokeDashoffset="163.36"
                                                        data-target={gauge.target}
                                                    />
                                                </svg>
                                                <div className="mt-2 font-mono text-[11px] font-bold text-slate-800">{gauge.label}</div>
                                                <div className="font-mono text-[9px] text-slate-400">{gauge.sub}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/50 p-3.5 font-mono text-[11px] text-teal-900">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold">CLINICAL READINESS</span>
                                        <span className="flex items-center gap-1 text-teal-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> PASS
                                        </span>
                                    </div>
                                    <p className="mt-1 font-sans text-xs text-slate-600">
                                        Bridging hospital biomedical compliance with Python/MATLAB diagnostics and real-time software tools.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================================
            SECTION 6 — EDUCATION & BEYOND THE LAB
           ================================================================== */}
                <section id="education" className="border-t border-slate-200/80 bg-white/60 py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-sky-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                                ACADEMIC FOUNDATION &amp; CREDENTIALS
                            </div>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Education &amp; <span className="text-teal-600">Beyond the Lab</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <article className="edu-reveal clinical-card corner-marks rounded-3xl p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 font-mono text-xs font-bold text-teal-800">CLASS OF 2025</span>
                                    <span className="rounded-xl bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-teal-300">CGPA: 6.67</span>
                                </div>
                                <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                                    Shri Govindram Seksaria Institute of Technology and Science (SGSITS), Indore
                                </h3>
                                <p className="mt-2 text-sm font-semibold text-teal-700">B.Tech in Biomedical Engineering</p>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                    Comprehensive engineering curriculum combining biomedical instrumentation, medical image processing, clinical signal analysis, electronics, and healthcare software engineering.
                                </p>
                            </article>

                            <article className="edu-reveal clinical-card corner-marks rounded-3xl p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 font-mono text-xs font-bold text-sky-800">2019 – 2021</span>
                                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-700">CBSE BOARD</span>
                                </div>
                                <h3 className="mt-4 text-xl font-extrabold text-slate-900">Holy Cross School, Indore</h3>
                                <p className="mt-2 text-sm font-semibold text-sky-700">Senior Secondary &amp; High School</p>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                                        <div className="font-mono text-[10px] font-semibold text-slate-400">12TH CBSE (2021)</div>
                                        <div className="mt-1 font-mono text-2xl font-extrabold text-slate-900">73%</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                                        <div className="font-mono text-[10px] font-semibold text-slate-400">10TH CBSE (2019)</div>
                                        <div className="mt-1 font-mono text-2xl font-extrabold text-slate-900">71.2%</div>
                                    </div>
                                </div>
                            </article>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="edu-reveal clinical-card group rounded-3xl p-6 hover:-translate-y-1">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-5-9a5 5 0 0010 0V5H7v7zm0 0H4a2 2 0 01-2-2V7h5m10 5h3a2 2 0 002-2V7h-5" />
                                    </svg>
                                </div>
                                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-600">Sports Achievements</div>
                                <h3 className="mt-1 text-lg font-bold text-slate-900">Competitive Athletics</h3>
                                <ul className="mt-2.5 space-y-1.5 text-sm text-slate-600">
                                    <li>&bull; <strong className="text-slate-800">Silver Medallist</strong> in Basketball (2016)</li>
                                    <li>&bull; <strong className="text-slate-800">Bronze Medallist</strong> in Kho-Kho &amp; Basketball (2018)</li>
                                </ul>
                            </div>

                            <div className="edu-reveal clinical-card group rounded-3xl p-6 hover:-translate-y-1">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-600">Clinical Workshop</div>
                                <h3 className="mt-1 text-lg font-bold text-slate-900">B. Braun Medical (India)</h3>
                                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                                    Completed the <strong className="text-slate-800">Care &amp; Maintenance Workshop</strong> by B. Braun Medical (India) Pvt. Ltd. in June 2023.
                                </p>
                            </div>

                            <div className="edu-reveal clinical-card group rounded-3xl p-6 hover:-translate-y-1">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-transform duration-300 group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-600">Hobbies &amp; Interests</div>
                                <h3 className="mt-1 text-lg font-bold text-slate-900">Energy Outside the Hospital</h3>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors group-hover:border-teal-200 group-hover:bg-teal-50">Badminton</span>
                                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors group-hover:border-sky-200 group-hover:bg-sky-50">Dancing</span>
                                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors group-hover:border-amber-200 group-hover:bg-amber-50">Cooking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================================================
            SECTION 7 — CLINICAL CONTACT CONSOLE
           ================================================================== */}
                <section id="contact" className="py-20 sm:py-24">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="corner-marks relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 shadow-clinical-lg sm:p-10 lg:p-12">
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-sky-500 to-teal-500" />

                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-1.5">
                                    <span className="vital-ping h-2 w-2 rounded-full bg-red-500" />
                                    <span className="font-mono text-[10px] font-bold tracking-widest text-teal-900 sm:text-[11px]">
                                        OPEN FOR COLLABORATIONS &amp; BIOMEDICAL INNOVATION
                                    </span>
                                </div>
                                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    Initiate Clinical <span className="text-teal-600">Transmission</span>
                                </h2>
                                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
                                    Reach out to discuss hospital biomedical operations, medical image processing, healthcare AI/ML projects, or engineering collaborations.
                                </p>
                            </div>

                            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Email Tile */}
                                <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-teal-300 hover:bg-white hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <div className="min-w-0">
                                            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Direct Email</div>
                                            <a href="mailto:joharesuhani@gmail.com" className="interactive-target block truncate text-sm font-bold text-slate-900 hover:text-teal-700">
                                                joharesuhani@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <a
                                            href="mailto:joharesuhani@gmail.com"
                                            className="interactive-target flex-1 rounded-xl bg-teal-600 px-3 py-2 text-center font-mono text-[11px] font-bold text-white transition-colors hover:bg-teal-700"
                                        >
                                            SEND EMAIL
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleCopyEmail}
                                            className="interactive-target inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-[11px] font-bold text-slate-700 transition-colors hover:border-teal-400 hover:text-teal-700"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>COPY</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Tile */}
                                <a
                                    href="tel:+916261076103"
                                    className="interactive-target group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-sky-300 hover:bg-white hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mobile Line</div>
                                            <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700">+91 6261076103</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between font-mono text-[11px] font-bold text-sky-700">
                                        <span>CALL INDORE, IN</span>
                                        <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                                    </div>
                                </a>

                                {/* LinkedIn Tile */}
                                <a
                                    href="https://www.linkedin.com/in/suhani-johare"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="interactive-target group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-sky-400 hover:bg-white hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-sm">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">LinkedIn Profile</div>
                                            <div className="text-sm font-bold text-slate-900 group-hover:text-[#0A66C2]">linkedin.com/in/suhani-johare</div>
                                        </div>
                                    </div>
                                    <span className="font-mono text-sm font-bold text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0A66C2]">&nearr;</span>
                                </a>

                                {/* GitHub Tile */}
                                <a
                                    href="https://github.com/suhanijohare"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="interactive-target group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-slate-500 hover:bg-white hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2A10 10 0 0 0 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">GitHub Repositories</div>
                                            <div className="text-sm font-bold text-slate-900 group-hover:text-slate-700">github.com/suhanijohare</div>
                                        </div>
                                    </div>
                                    <span className="font-mono text-sm font-bold text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900">&nearr;</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* CLINICAL FOOTER */}
            <footer className="border-t border-slate-200/80 bg-white/80 py-8 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-teal-600" />
                        <span className="font-mono text-xs font-bold text-slate-800">SUHANI JOHARE // BIOMEDICAL ENGINEER</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                        INDORE, INDIA &bull; DOB: 30 MAR 2003 &bull; CLINICAL BLUEPRINT EDITION
                    </div>
                </div>
            </footer>

            {/* FLOATING DIAGNOSTIC TOAST */}
            <div
                role="status"
                aria-live="polite"
                className={`pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-teal-300 bg-slate-900 px-5 py-3 text-white shadow-2xl transition-all duration-300 ${toast.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
            >
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_#2DD4BF]" />
                <span className="font-mono text-xs font-semibold tracking-wider">{toast.message}</span>
            </div>
        </div>
    );
}