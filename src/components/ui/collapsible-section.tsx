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
        "rounded-lg border border-zinc-200 bg-white shadow-2xs transition-all overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between p-4 sm:p-5 text-left hover:bg-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-inset cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/80">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
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
              <p className="text-xs text-zinc-500 leading-normal max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pl-3">
          <span className="text-xs text-zinc-400 hidden sm:inline">
            {isOpen ? "Hide" : "Show"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-zinc-400 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-100 p-4 sm:p-6 space-y-5 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
