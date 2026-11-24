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
    teal: "bg-teal-50 text-teal-800 border-teal-200/80",
    navy: "bg-zinc-900 text-zinc-100 border-zinc-800",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80",
    error: "bg-rose-50 text-rose-800 border-rose-200/80",
    neutral: "bg-zinc-100 text-zinc-700 border-zinc-200",
    outline: "bg-transparent text-zinc-700 border-zinc-300",
  }[variant];

  const dotStyles = {
    teal: "bg-teal-600",
    navy: "bg-zinc-400",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    error: "bg-rose-600",
    neutral: "bg-zinc-500",
    outline: "bg-zinc-500",
  }[variant];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium tracking-normal transition-colors",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotStyles)} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
