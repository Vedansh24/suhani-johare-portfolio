import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "teal" | "cobalt" | "coral" | "muted";

export interface ClinicalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
  size?: "sm" | "md";
}

export function ClinicalBadge({
  className,
  children,
  variant = "teal",
  pulse = false,
  size = "md",
  ...props
}: ClinicalBadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    teal: {
      container: "bg-surgical-teal/10 text-surgical-teal border-surgical-teal/20",
      dot: "bg-surgical-teal",
    },
    cobalt: {
      container: "bg-medical-cobalt/10 text-medical-cobalt border-medical-cobalt/20",
      dot: "bg-medical-cobalt",
    },
    coral: {
      container: "bg-vital-coral/10 text-vital-coral border-vital-coral/20",
      dot: "bg-vital-coral",
    },
    muted: {
      container: "bg-clinical-muted/10 text-clinical-muted border-clinical-grid",
      dot: "bg-clinical-muted",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border font-mono tracking-wider uppercase transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        currentVariant.container,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          currentVariant.dot,
          pulse && "animate-ping"
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

