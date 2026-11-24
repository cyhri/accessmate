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
    default: "bg-white border-zinc-200/90 text-zinc-900 shadow-2xs",
    mint: "bg-teal-50/40 border-teal-200/70 text-zinc-900 shadow-2xs",
    navy: "bg-zinc-900 border-zinc-800 text-white shadow-2xs",
    subtle: "bg-zinc-50 border-zinc-200/80 text-zinc-900",
  }[variant];

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
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
      className={cn("flex flex-col space-y-1.5 p-5", className)}
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
        "text-base font-semibold leading-snug tracking-tight text-inherit",
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
      className={cn("text-xs text-zinc-500 leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-5 pt-0 border-t border-zinc-100 mt-4", className)}
      {...props}
    />
  );
}
