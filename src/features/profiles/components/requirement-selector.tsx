"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { RequirementLevel } from "@/constants";

export interface RequirementSelectorProps {
  readonly id?: string;
  readonly label: string;
  readonly description?: string;
  readonly value: RequirementLevel;
  readonly onChange: (nextLevel: RequirementLevel) => void;
  readonly disabled?: boolean;
}

export function RequirementSelector({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
}: RequirementSelectorProps) {
  const options: {
    readonly level: RequirementLevel;
    readonly title: string;
    readonly badge: string;
    readonly activeClass: string;
  }[] = [
    {
      level: "not_required",
      title: "Not Needed",
      badge: "Irrelevant",
      activeClass: "bg-slate-100 text-slate-800 border-slate-300 font-semibold shadow-2xs",
    },
    {
      level: "preferred",
      title: "Preferred",
      badge: "Nice-to-have",
      activeClass: "bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-2xs ring-1 ring-amber-300",
    },
    {
      level: "essential",
      title: "Essential",
      badge: "Must-have Blocker",
      activeClass: "bg-teal-600 text-white border-teal-700 font-semibold shadow-2xs ring-1 ring-teal-600",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="space-y-0.5 max-w-md">
        <label htmlFor={id} className="text-sm font-medium text-slate-800 leading-snug">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 leading-normal">{description}</p>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={`${label} requirement level`}
        className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 shrink-0"
      >
        {options.map((opt) => {
          const isSelected = value === opt.level;
          return (
            <button
              key={opt.level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(opt.level)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md border border-transparent transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 select-none",
                isSelected
                  ? opt.activeClass
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              )}
            >
              <span>{opt.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
