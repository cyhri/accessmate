import React from "react";
import { Info, FileCode2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { Badge } from "./badge";

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
      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5 text-zinc-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">
                {title}
              </span>
              <Badge variant="neutral" size="sm">
                Planned for {phase}
              </Badge>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {description} This module is currently planned and will be integrated with real-time hazard detection in an upcoming release.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Planned Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-sm">Planned Capabilities</CardTitle>
            <CardDescription>
              User capabilities designed for this module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-zinc-600">
              {plannedCapabilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-medium text-[10px] mt-0.5">
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
            <CardTitle className="text-sm">Architectural Contracts</CardTitle>
            <CardDescription>
              Defined domain contracts ready for live service integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-zinc-600 font-mono">
              {architecturalContracts.map((contract, index) => (
                <li key={index} className="flex items-center gap-2 rounded-md bg-zinc-50 px-2.5 py-1.5 border border-zinc-200/60">
                  <FileCode2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
                  <span className="truncate text-zinc-700">{contract}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
