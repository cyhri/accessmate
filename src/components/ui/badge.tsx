import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: "teal" | "navy" | "success" | "warning" | "error" | "neutral" | "outline";
  readonly size?: "sm" | "md";
  readonly dot?: boolean;
}

export function Badge({
  className,
  variant = "teal",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    navy: "bg-slate-900 text-slate-100 border-slate-700",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "bg-transparent text-slate-700 border-slate-300",
  }[variant];

  const dotStyles = {
    teal: "bg-teal-600",
    navy: "bg-slate-400",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    error: "bg-rose-600",
    neutral: "bg-slate-500",
    outline: "bg-slate-500",
  }[variant];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide transition-colors",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles)} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
