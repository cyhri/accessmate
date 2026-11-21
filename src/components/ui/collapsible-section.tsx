"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface CollapsibleSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly badge?: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly requiredCount?: number;
}

export function CollapsibleSection({
  title,
  description,
  icon,
  badge,
  defaultOpen = true,
  children,
  className,
  requiredCount,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white shadow-2xs transition-all overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                {title}
              </h3>
              {badge && (
                <Badge variant="teal" size="sm">
                  {badge}
                </Badge>
              )}
              {typeof requiredCount === "number" && requiredCount > 0 && (
                <Badge variant="navy" size="sm">
                  {requiredCount} configured
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500 leading-normal max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pl-3">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline">
            {isOpen ? "Collapse" : "Expand"}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-slate-400 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 p-4 sm:p-6 space-y-5 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
