import React from "react";
import { cn } from "@/lib/utils";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: "info" | "teal" | "warning" | "error" | "success" | "neutral";
  readonly icon?: React.ReactNode;
}

export function Alert({
  className,
  variant = "info",
  icon,
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: "border-blue-200 bg-blue-50/70 text-blue-900",
    teal: "border-teal-200 bg-teal-50/70 text-teal-900",
    warning: "border-amber-200 bg-amber-50/70 text-amber-900",
    error: "border-rose-200 bg-rose-50/70 text-rose-900",
    success: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    neutral: "border-zinc-200 bg-zinc-50/80 text-zinc-800",
  }[variant];

  const defaultIcons = {
    info: <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" aria-hidden="true" />,
    teal: <Info className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" aria-hidden="true" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />,
    error: <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />,
    success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />,
    neutral: <Info className="h-4 w-4 shrink-0 text-zinc-600 mt-0.5" aria-hidden="true" />,
  }[variant];

  return (
    <div
      role="region"
      aria-label="System notification"
      className={cn(
        "relative flex w-full gap-3 rounded-lg border p-4 text-sm leading-relaxed shadow-2xs",
        variantStyles,
        className
      )}
      {...props}
    >
      <div className="shrink-0">{icon ?? defaultIcons}</div>
      <div className="flex-1 space-y-1">{children}</div>
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("font-semibold leading-none tracking-tight text-inherit", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-xs sm:text-sm leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}
