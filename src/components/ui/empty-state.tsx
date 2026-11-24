import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly badge?: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  badge,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white p-8 sm:p-12 text-center",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 mb-3 border border-zinc-200/60">
        {icon}
      </div>
      {badge && <div className="mb-2">{badge}</div>}
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-md leading-relaxed mb-5">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
