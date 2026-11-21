"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvidenceItem } from "@/types/assessment";
import type { EvidenceStatus } from "@/constants";
import { EVIDENCE_STATUSES } from "@/constants";

export interface EvidenceFieldEditorProps<T> {
  readonly label: string;
  readonly description?: string;
  readonly item: EvidenceItem<T>;
  readonly onChange: (updated: EvidenceItem<T>) => void;
  readonly type: "boolean" | "number" | "select";
  readonly selectOptions?: readonly { readonly value: string; readonly label: string }[];
  readonly unit?: string;
  readonly min?: number;
  readonly max?: number;
  readonly placeholder?: string;
}

export function EvidenceFieldEditor<T extends boolean | number | string | null>({
  label,
  description,
  item,
  onChange,
  type,
  selectOptions,
  unit,
  min = 0,
  max,
  placeholder,
}: EvidenceFieldEditorProps<T>) {
  const [showMetadata, setShowMetadata] = useState(Boolean(item.notes || item.source));

  const handleStatusChange = (status: EvidenceStatus) => {
    onChange({
      ...item,
      status,
    });
  };

  const handleNotesChange = (notes: string) => {
    onChange({
      ...item,
      notes: notes.trim() === "" ? undefined : notes,
    });
  };

  const handleSourceChange = (source: string) => {
    onChange({
      ...item,
      source: source.trim() === "" ? undefined : source,
    });
  };

  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-0.5 max-w-md">
          <label className="text-sm font-medium text-slate-800 leading-snug">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 leading-normal">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Value Control */}
          {type === "boolean" && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => onChange({ ...item, value: true as T })}
                className={cn(
                  "px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer",
                  item.value === true
                    ? "bg-teal-600 text-white shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Yes / Present
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...item, value: false as T })}
                className={cn(
                  "px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer",
                  item.value === false
                    ? "bg-slate-800 text-white shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                No / Absent
              </button>
            </div>
          )}

          {type === "number" && (
            <div className="relative rounded-lg shadow-2xs w-32">
              <input
                type="number"
                min={min}
                max={max}
                value={item.value === null ? "" : String(item.value)}
                placeholder={placeholder ?? (unit ? `in ${unit}` : "Value")}
                onChange={(e) =>
                  onChange({
                    ...item,
                    value: (e.target.value === "" ? null : Number(e.target.value)) as T,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-2.5 pr-8 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              />
              {unit && (
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[11px] font-medium text-slate-400">
                  {unit}
                </span>
              )}
            </div>
          )}

          {type === "select" && selectOptions && (
            <select
              value={String(item.value ?? "")}
              onChange={(e) => onChange({ ...item, value: e.target.value as T })}
              className="text-xs rounded-lg border border-slate-300 bg-white py-1.5 pl-2.5 pr-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              {selectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Evidence Confidence Status Dropdown */}
          <select
            value={item.status}
            onChange={(e) => handleStatusChange(e.target.value as EvidenceStatus)}
            aria-label={`${label} evidence confidence status`}
            className={cn(
              "text-xs rounded-lg border py-1.5 pl-2.5 pr-7 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600",
              item.status === EVIDENCE_STATUSES.VERIFIED && "bg-emerald-50 text-emerald-800 border-emerald-300",
              item.status === EVIDENCE_STATUSES.USER_REPORTED && "bg-sky-50 text-sky-800 border-sky-300",
              item.status === EVIDENCE_STATUSES.UNVERIFIED && "bg-amber-50 text-amber-800 border-amber-300",
              item.status === EVIDENCE_STATUSES.UNKNOWN && "bg-slate-100 text-slate-700 border-slate-300",
              item.status === EVIDENCE_STATUSES.NOT_APPLICABLE && "bg-slate-50 text-slate-500 border-slate-200"
            )}
          >
            <option value="verified">Verified Audit</option>
            <option value="user_reported">User Reported</option>
            <option value="unverified">Unverified Claim</option>
            <option value="unknown">Not Surveyed / Unknown</option>
            <option value="not_applicable">Not Applicable</option>
          </select>

          {/* Toggle Notes/Source button */}
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            title="Add notes or source provenance"
            aria-expanded={showMetadata}
            className={cn(
              "p-1.5 rounded-lg border text-xs transition-colors cursor-pointer",
              showMetadata || item.notes || item.source
                ? "bg-teal-50 border-teal-300 text-teal-700"
                : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Toggle notes and source for {label}</span>
          </button>
        </div>
      </div>

      {/* Expandable Evidence Provenance & Inspector Notes */}
      {showMetadata && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-0.5">
              Auditor Notes / Condition Details
            </label>
            <input
              type="text"
              value={item.notes ?? ""}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g. West entrance only; heavy door during high wind"
              className="w-full text-xs rounded border border-slate-300 bg-white px-2 py-1 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-0.5">
              Source / Audit Provenance
            </label>
            <input
              type="text"
              value={item.source ?? ""}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="e.g. City Accessibility Audit 2026, Inspector J. Doe"
              className="w-full text-xs rounded border border-slate-300 bg-white px-2 py-1 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
