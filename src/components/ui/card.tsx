import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: "default" | "mint" | "navy" | "subtle";
}

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white border-slate-200 text-slate-900 shadow-xs",
    mint: "bg-teal-50/50 border-teal-200/70 text-slate-900 shadow-xs",
    navy: "bg-slate-900 border-slate-800 text-white shadow-xs",
    subtle: "bg-slate-50/80 border-slate-200/80 text-slate-900",
  }[variant];

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base sm:text-lg font-semibold leading-snug tracking-tight text-inherit",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs sm:text-sm text-slate-500 leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-5 sm:p-6 pt-0 border-t border-slate-100 mt-4", className)}
      {...props}
    />
  );
}
