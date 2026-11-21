import React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: "info" | "warning" | "error" | "success";
}

export function Alert({
  className,
  variant = "info",
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
    error: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  }[variant];

  return (
    <div
      role="region"
      aria-label="Important notice"
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm leading-relaxed",
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
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
      className={cn("text-xs md:text-sm [&_p]:leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}
