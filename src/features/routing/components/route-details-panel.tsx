"use client";

import React from "react";
import {
  Footprints,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Sparkles,
  Cpu,
  ShieldAlert,
  Navigation,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { FullRoutePlan } from "../types";
import type { AssessmentOutcome } from "@/constants/index";

export interface RouteDetailsPanelProps {
  readonly routes: readonly FullRoutePlan[];
  readonly selectedRouteIndex: number;
  readonly onSelectRoute: (index: number) => void;
  readonly profileName: string;
}

export function RouteDetailsPanel({
  routes,
  selectedRouteIndex,
  onSelectRoute,
  profileName,
}: RouteDetailsPanelProps) {
  const currentRoute = routes[selectedRouteIndex] ?? routes[0];
  const assessment = currentRoute?.assessment;

  if (!currentRoute) return null;

  const getOutcomeTheme = (outcome?: AssessmentOutcome) => {
    switch (outcome) {
      case "suitable":
        return {
          badgeVariant: "success" as const,
          border: "border-emerald-300",
          bg: "bg-emerald-50/50",
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
          titleColor: "text-emerald-950",
        };
      case "suitable_with_arrangements":
        return {
          badgeVariant: "teal" as const,
          border: "border-teal-300",
          bg: "bg-teal-50/50",
          icon: <CheckCircle2 className="h-5 w-5 text-teal-600" />,
          titleColor: "text-teal-950",
        };
      case "difficult":
        return {
          badgeVariant: "warning" as const,
          border: "border-amber-300",
          bg: "bg-amber-50/50",
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          titleColor: "text-amber-950",
        };
      case "unsuitable":
        return {
          badgeVariant: "error" as const,
          border: "border-rose-300",
          bg: "bg-rose-50/50",
          icon: <XCircle className="h-5 w-5 text-rose-600" />,
          titleColor: "text-rose-950",
        };
      case "insufficient_information":
      default:
        return {
          badgeVariant: "neutral" as const,
          border: "border-zinc-300",
          bg: "bg-zinc-50/70",
          icon: <HelpCircle className="h-5 w-5 text-zinc-600" />,
          titleColor: "text-zinc-950",
        };
    }
  };

  const outcomeTheme = getOutcomeTheme(assessment?.overallOutcome);

  return (
    <div className="space-y-6">
      {/* Route Alternatives Selector Tabs (if multiple routes) */}
      {routes.length > 1 && (
        <div className="flex gap-2 p-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
          {routes.map((r, idx) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRoute(idx)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                idx === selectedRouteIndex
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
              }`}
            >
              {idx === 0 ? "Primary Route" : `Alternative #${idx}`} ({r.distanceMeters}m &bull; ~{r.durationMinutes}m)
            </button>
          ))}
        </div>
      )}

      {/* A. Route Overview & Metrics */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.04] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={currentRoute.isAlternative ? "neutral" : "teal"} size="sm">
                {currentRoute.isAlternative ? "Alternative Route" : "Primary Wheelchair Path"}
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                {currentRoute.dataSource === "live_ors" ? "Live ORS Network" : "Benchmark Network"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#111110] font-display mt-1">{currentRoute.name}</h3>
            <p className="text-xs text-zinc-500">
              From <span className="font-semibold text-zinc-700">{currentRoute.originLabel}</span> to{" "}
              <span className="font-semibold text-zinc-700">{currentRoute.destinationLabel}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 p-2.5 rounded-xl border border-black/[0.04]">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Distance</span>
              <span className="text-base font-bold text-zinc-900 font-mono tabular-nums">{currentRoute.distanceMeters}m</span>
            </div>
            <div className="h-6 w-px bg-black/[0.06]" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Duration</span>
              <span className="text-base font-bold text-zinc-900 font-mono tabular-nums">~{currentRoute.durationMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Warning or Demo Notice if present */}
        {currentRoute.warningNotice && (
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{currentRoute.warningNotice}</span>
          </div>
        )}

        {/* B. 5-Tier Accessibility Assessment Banner */}
        {assessment && (
          <div className={`p-4 sm:p-5 rounded-lg border ${outcomeTheme.border} ${outcomeTheme.bg} space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {outcomeTheme.icon}
                <Badge variant={outcomeTheme.badgeVariant} size="sm">
                  {assessment.overallOutcome.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>
              <span className="text-xs text-zinc-500 font-mono">Profile: {profileName}</span>
            </div>

            <h4 className={`text-base font-bold ${outcomeTheme.titleColor}`}>
              {assessment.outcomeTitle}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
              {assessment.outcomeDescription}
            </p>

            {/* Essential Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-white/80 p-2 rounded-lg border border-zinc-200">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Essential</span>
                <span className="text-sm font-bold text-zinc-800">{assessment.essentialRequirements.total}</span>
              </div>
              <div className="bg-emerald-50/90 p-2 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">Satisfied</span>
                <span className="text-sm font-bold text-emerald-900">{assessment.essentialRequirements.satisfiedCount}</span>
              </div>
              <div className="bg-rose-50/90 p-2 rounded-lg border border-rose-200">
                <span className="text-[10px] text-rose-700 uppercase font-bold block">Barriers</span>
                <span className="text-sm font-bold text-rose-900">{assessment.barriers.length}</span>
              </div>
              <div className="bg-amber-50/90 p-2 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase font-bold block">Info Gaps</span>
                <span className="text-sm font-bold text-amber-900">{assessment.informationGaps.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* C. Route Characteristics Breakdown */}
      <CollapsibleSection
        title="Physical Route Characteristics"
        description="Surface materials, street gradient incline, and physical stairs classification."
        icon={<Footprints className="h-5 w-5 text-teal-600" />}
        defaultOpen={true}
      >
        <div className="space-y-4 pt-2">
          {/* Surface Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-zinc-700">
              <span>Ground Surface Materials</span>
              <span>
                {currentRoute.characteristics.surfaceDistribution["asphalt"] || 0}% Asphalt •{" "}
                {currentRoute.characteristics.surfaceDistribution["cobblestone"] || 0}% Cobblestone •{" "}
                {currentRoute.characteristics.unknownSurfacePercent}% Unknown
              </span>
            </div>
            {/* Visual Surface Bar */}
            <div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${(currentRoute.characteristics.surfaceDistribution["asphalt"] ?? 0) + (currentRoute.characteristics.surfaceDistribution["concrete"] ?? 0) + (currentRoute.characteristics.surfaceDistribution["paved"] ?? 0)}%` }}
                title="Smooth Pavement / Asphalt"
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${currentRoute.characteristics.surfaceDistribution["cobblestone"] ?? 0}%` }}
                title="Cobblestones"
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(currentRoute.characteristics.surfaceDistribution["gravel"] ?? 0) + (currentRoute.characteristics.surfaceDistribution["ground"] ?? 0)}%` }}
                title="Loose Gravel / Dirt"
              />
              <div
                className="bg-zinc-400 h-full"
                style={{ width: `${currentRoute.characteristics.unknownSurfacePercent}%` }}
                title="Unknown Surface"
              />
            </div>
          </div>

          {/* Incline & Stair Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/60">
              <span className="text-[11px] font-bold uppercase text-zinc-500 block">Maximum Incline</span>
              <span className="text-lg font-bold text-zinc-900">
                {currentRoute.characteristics.maxInclinePercent}%
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                {currentRoute.characteristics.maxInclinePercent <= 5 ? "Gentle slope" : "Moderate to steep grade"}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/60">
              <span className="text-[11px] font-bold uppercase text-zinc-500 block">Known Stairs / Steps</span>
              <span className={`text-lg font-bold ${currentRoute.characteristics.hasKnownSteps ? "text-rose-600" : "text-emerald-600"}`}>
                {currentRoute.characteristics.hasKnownSteps
                  ? `${currentRoute.characteristics.knownStepsCount} Steps Logged`
                  : "0 Confirmed Steps"}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                {currentRoute.characteristics.hasKnownSteps ? "Physical barrier present" : "Step-free corridor"}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/60">
              <span className="text-[11px] font-bold uppercase text-zinc-500 block">Unmeasured Data</span>
              <span className="text-lg font-bold text-zinc-700">
                {currentRoute.characteristics.unknownSurfacePercent}%
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                Missing OSM surface tags
              </span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* D. Detected Barriers (if any) */}
      {assessment && assessment.barriers.length > 0 && (
        <CollapsibleSection
          title={`Detected Route Barriers (${assessment.barriers.length})`}
          description="Specific environmental hazards or obstructions along this corridor."
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
          defaultOpen={true}
        >
          <div className="space-y-3 pt-2">
            {assessment.barriers.map((barrier) => (
              <div
                key={barrier.id}
                className="p-4 rounded-lg border border-rose-200 bg-rose-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="error" size="sm">
                    {barrier.severity.toUpperCase()} BARRIER
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">Rule: {barrier.ruleId}</span>
                </div>
                <h5 className="text-sm font-bold text-zinc-900">{barrier.title}</h5>
                <p className="text-xs text-zinc-700 leading-relaxed">{barrier.description}</p>
                {barrier.recommendedAction && (
                  <div className="text-xs text-rose-950 bg-white/80 p-2.5 rounded-lg border border-rose-200/60">
                    <span className="font-semibold text-rose-900">Recommended Action: </span>
                    {barrier.recommendedAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* E. Information Gaps & Uncertainty */}
      {assessment && assessment.informationGaps.length > 0 && (
        <CollapsibleSection
          title={`Information Gaps &amp; Missing Data (${assessment.informationGaps.length})`}
          description="Features lacking recorded OpenStreetMap data. Under the Uncertainty Principle, missing data is never assumed accessible."
          icon={<HelpCircle className="h-5 w-5 text-amber-600" />}
          defaultOpen={true}
        >
          <div className="space-y-3 pt-2">
            {assessment.informationGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="warning" size="sm">
                    Unmeasured Feature
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">Rule: {gap.ruleId}</span>
                </div>
                <h5 className="text-sm font-bold text-zinc-900">{gap.feature}</h5>
                <p className="text-xs text-zinc-700">{gap.whyNeeded}</p>
                <div className="text-xs text-amber-950 bg-white/80 p-2 rounded-lg border border-amber-200">
                  <span className="font-semibold text-amber-900">How to Verify: </span>
                  {gap.recommendedVerification}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* F. Accessibility Strengths */}
      {assessment && assessment.strengths.length > 0 && (
        <CollapsibleSection
          title={`Route Accessibility Strengths (${assessment.strengths.length})`}
          description="Verified features that facilitate independent movement along this path."
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {assessment.strengths.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="success" size="sm">
                    Verified Feature
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">Rule: {s.ruleId}</span>
                </div>
                <h5 className="text-sm font-bold text-zinc-900">{s.title}</h5>
                <p className="text-xs text-zinc-700">{s.description}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* G. Turn-by-Turn Navigation Steps */}
      {currentRoute.steps.length > 0 && (
        <CollapsibleSection
          title={`Turn-by-Turn Steps (${currentRoute.steps.length} Segments)`}
          description="Pedestrian maneuvers and waypoint directions."
          icon={<Navigation className="h-5 w-5 text-zinc-600" />}
          defaultOpen={false}
        >
          <div className="space-y-2 pt-2">
            {currentRoute.steps.map((st, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50/60 text-xs"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px]">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="font-semibold text-zinc-900">{st.instruction}</div>
                  <div className="text-[11px] text-zinc-500">
                    {st.name} • {st.distanceMeters}m ({Math.round(st.durationSeconds / 60)} min)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* H. Explainable Rule Trace */}
      {assessment && assessment.explanationTraces.length > 0 && (
        <CollapsibleSection
          title={`Explainable Inference Trace (${assessment.explanationTraces.length} Rules Fired)`}
          description="Complete transparent audit trail: which route rules fired and which facts matched."
          icon={<Cpu className="h-5 w-5 text-zinc-700" />}
          defaultOpen={false}
        >
          <div className="space-y-3 pt-2 font-mono text-xs">
            {assessment.explanationTraces.map((trace) => (
              <div
                key={`${trace.ruleId}-${trace.firedSequence}`}
                className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-teal-600 text-white font-bold text-[10px]">
                      #{trace.firedSequence}
                    </span>
                    <span className="font-bold text-zinc-900">{trace.ruleId}: {trace.ruleName}</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {trace.category}
                  </Badge>
                </div>
                <div className="text-zinc-700">{trace.conclusion}</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* I. Practical Next-Step Recommendations */}
      {assessment && assessment.recommendations.length > 0 && (
        <CollapsibleSection
          title={`Recommended Actions (${assessment.recommendations.length})`}
          description="Prioritized next steps before starting your journey."
          icon={<Sparkles className="h-5 w-5 text-teal-600" />}
          defaultOpen={true}
        >
          <div className="space-y-2.5 pt-2">
            {assessment.recommendations.map((rec, idx) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 bg-white shadow-2xs"
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    rec.priority === "critical"
                      ? "bg-rose-100 text-rose-800"
                      : rec.priority === "high"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h6 className="text-xs font-bold text-zinc-900">{rec.title}</h6>
                    <Badge
                      variant={
                        rec.priority === "critical"
                          ? "error"
                          : rec.priority === "high"
                          ? "warning"
                          : "teal"
                      }
                      size="sm"
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-600">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* J. Data Transparency & Legal Disclaimer Notice */}
      <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-zinc-800 uppercase tracking-wide text-[11px]">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          Data Transparency &amp; Real-World Limitations
        </div>
        <p className="leading-relaxed">
          Route assessments are based on available OpenStreetMap and routing-provider data. Accessibility
          information may be incomplete, outdated or unverified. ACCESSMATE provides decision support and does not
          guarantee that a route is safe or fully accessible. Confirm critical conditions before travelling.
        </p>
        <div className="pt-1 flex flex-wrap gap-4 text-[11px] text-zinc-500 font-mono">
          <span>Data Source: {currentRoute.dataSource === "live_ors" ? "OpenRouteService / HeiGIT" : "Benchmark Pedestrian Dataset"}</span>
          <span>Tile Provider: OpenStreetMap</span>
          <span>Attribution: &copy; OpenStreetMap contributors</span>
        </div>
      </div>
    </div>
  );
}
