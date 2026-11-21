"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  readonly content: string;
  readonly label?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export function Tooltip({
  content,
  label = "More information",
  children,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex items-center text-slate-400 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-full p-0.5 transition-colors cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children ?? <Info className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      {isVisible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-xs z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal text-slate-100 shadow-md ring-1 ring-slate-800 pointer-events-none leading-relaxed"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
}
