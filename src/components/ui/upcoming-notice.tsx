import React from "react";
import { AlertCircle, FileCode2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import Link from "next/link";

export interface UpcomingFeatureNoticeProps {
  readonly title: string;
  readonly phase: string;
  readonly description: string;
  readonly plannedCapabilities: readonly string[];
  readonly architecturalContracts: readonly string[];
}

export function UpcomingFeatureNotice({
  title,
  phase,
  description,
  plannedCapabilities,
  architecturalContracts,
}: UpcomingFeatureNoticeProps) {
  return (
    <div className="space-y-6">
      {/* Scope banner */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5 text-amber-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm sm:text-base">
                {title} — Implementation Scheduled
              </span>
              <Badge variant="warning" size="sm">
                {phase} Milestone
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              {description} In accordance with the project roadmap, interactive submission forms,
              inference rules, and live services will be implemented in subsequent phases.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Planned Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between mb-1">
              <CardTitle>Planned Capabilities</CardTitle>
              <Badge variant="teal" size="sm">
                Functional Scope
              </Badge>
            </div>
            <CardDescription>
              User-facing features designed for this module in {phase}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              {plannedCapabilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[11px] mt-0.5">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between mb-1">
              <CardTitle>Architectural Contracts</CardTitle>
              <Badge variant="neutral" size="sm">
                TypeScript Strictly Defined
              </Badge>
            </div>
            <CardDescription>
              Pre-defined domain contracts established in Phase 1 ready for engine implementation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-mono">
              {architecturalContracts.map((contract, index) => (
                <li key={index} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-200/60">
                  <FileCode2 className="h-4 w-4 text-teal-600 shrink-0" aria-hidden="true" />
                  <span className="truncate text-slate-700">{contract}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Return to Dashboard guidance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="space-y-0.5 text-center sm:text-left">
          <h4 className="text-sm font-semibold text-slate-900">Explore Completed Modules</h4>
          <p className="text-xs text-slate-500">
            View the system overview, decision-support methodology, and roadmap on the dashboard.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
