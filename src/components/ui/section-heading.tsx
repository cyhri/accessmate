import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  readonly title: string;
  readonly description?: string;
  readonly badge?: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly className?: string;
  readonly titleAs?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  title,
  description,
  badge,
  action,
  className,
  titleAs: Component = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Component className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            {title}
          </Component>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pt-1 sm:pt-0">{action}</div>}
    </div>
  );
}
