import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ClinicalCardProps extends HTMLAttributes<HTMLDivElement> {
  calibrationRef?: string;
  hasCrosshairs?: boolean;
  cornerMarks?: boolean;
  elevation?: "none" | "subtle" | "diagnostic";
}

export const ClinicalCard = forwardRef<HTMLDivElement, ClinicalCardProps>(
  (
    {
      className,
      children,
      calibrationRef,
      hasCrosshairs = true,
      cornerMarks = false,
      elevation = "subtle",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "clinical-card relative rounded-xl text-clinical-ink p-6 transition-all duration-300",
          cornerMarks && "corner-marks",
          elevation === "subtle" && "shadow-clinical",
          elevation === "diagnostic" && "shadow-clinical-lg border-surgical-teal/40",
          className
        )}
        {...props}
      >
        {/* Architectural Blueprint Crosshairs */}
        {hasCrosshairs && (
          <>
            <span
              className="pointer-events-none absolute -top-1 -left-1 text-[10px] font-mono leading-none text-clinical-muted/40 select-none"
              aria-hidden="true"
            >
              +
            </span>
            <span
              className="pointer-events-none absolute -top-1 -right-1 text-[10px] font-mono leading-none text-clinical-muted/40 select-none"
              aria-hidden="true"
            >
              +
            </span>
            <span
              className="pointer-events-none absolute -bottom-1 -left-1 text-[10px] font-mono leading-none text-clinical-muted/40 select-none"
              aria-hidden="true"
            >
              +
            </span>
            <span
              className="pointer-events-none absolute -bottom-1 -right-1 text-[10px] font-mono leading-none text-clinical-muted/40 select-none"
              aria-hidden="true"
            >
              +
            </span>
          </>
        )}

        {/* Technical Calibration Reference Marker */}
        {calibrationRef && (
          <div className="mb-3 flex items-center justify-between border-b border-clinical-grid/60 pb-2 text-[10px] font-mono text-clinical-muted">
            <span className="tracking-widest uppercase">{calibrationRef}</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-surgical-teal animate-pulse" />
          </div>
        )}

        {children}
      </div>
    );
  }
);

ClinicalCard.displayName = "ClinicalCard";
