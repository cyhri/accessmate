import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  readonly lines?: number;
  readonly cardCount?: number;
  readonly className?: string;
  readonly message?: string;
}

export function LoadingState({
  lines = 3,
  cardCount = 0,
  className,
  message = "Loading accessibility data...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("w-full space-y-4", className)}
    >
      <span className="sr-only">{message}</span>

      {cardCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: cardCount }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className="h-4 rounded bg-slate-200 animate-pulse"
              style={{ width: `${Math.max(40, 100 - index * 20)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
