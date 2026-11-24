"use client";

import React from "react";
import { motion } from "framer-motion";
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
  id = "selector",
  label,
  description,
  value,
  onChange,
  disabled = false,
}: RequirementSelectorProps) {
  const options: {
    readonly level: RequirementLevel;
    readonly title: string;
    readonly activeTextColor: string;
  }[] = [
    {
      level: "not_required",
      title: "Not Needed",
      activeTextColor: "text-zinc-700",
    },
    {
      level: "preferred",
      title: "Preferred",
      activeTextColor: "text-amber-800",
    },
    {
      level: "essential",
      title: "Essential",
      activeTextColor: "text-teal-900 font-semibold",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 border-b border-black/[0.04] last:border-b-0 hover:bg-black/[0.01] transition-colors">
      <div className="space-y-0.5 max-w-md">
        <label htmlFor={id} className="text-xs font-semibold text-[#111110] leading-snug block">
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-zinc-500 leading-normal">{description}</p>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={`${label} requirement level`}
        className="relative inline-flex rounded-full bg-zinc-100 p-0.5 shrink-0"
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
                "relative px-3 py-1 text-xs rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black select-none z-10",
                isSelected
                  ? opt.activeTextColor
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId={`req-${id}-active`}
                  className="absolute inset-0 rounded-full bg-white shadow-2xs border border-black/[0.04] -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span>{opt.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
