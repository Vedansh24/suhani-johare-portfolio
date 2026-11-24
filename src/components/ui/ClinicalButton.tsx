import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ClinicalButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "vital";
  size?: "sm" | "md" | "lg";
}

export const ClinicalButton = forwardRef<HTMLButtonElement, ClinicalButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-mono text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
          // Sizes
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "lg" && "px-6 py-3.5 text-base",
          // Variants
          variant === "primary" &&
            "bg-surgical-teal text-white shadow-sm hover:bg-surgical-teal/90 active:scale-[0.98]",
          variant === "secondary" &&
            "bg-medical-cobalt text-white shadow-sm hover:bg-medical-cobalt/90 active:scale-[0.98]",
          variant === "outline" &&
            "border border-clinical-grid bg-clinical-surface text-clinical-ink hover:border-surgical-teal hover:text-surgical-teal hover:bg-surgical-teal/5 active:scale-[0.98]",
          variant === "ghost" &&
            "text-clinical-muted hover:text-clinical-ink hover:bg-clinical-grid/40",
          variant === "vital" &&
            "bg-vital-coral text-white shadow-sm hover:bg-vital-coral/90 active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ClinicalButton.displayName = "ClinicalButton";

