"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  SlidersHorizontal,
  Building2,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { EmptyState } from "@/components/ui/empty-state";
import {
  type ExpertEvaluationResult,
  InferenceEngine,
} from "@/features/expert-system";
import {
  profileRepository,
  getDefaultProfile,
  PROFILE_PRESETS,
  type ProfilePreset,
} from "@/features/profiles";
import { assessmentRepository, SAMPLE_BUILDING_ASSESSMENTS } from "@/features/assessment";
import type { UserAccessibilityProfile } from "@/types/profile";
import type { BuildingAssessmentRecord } from "@/types/assessment";
import type { AssessmentOutcome } from "@/constants/index";

export default function InferencePage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(getDefaultProfile);
  const [assessments, setAssessments] = useState<BuildingAssessmentRecord[]>(SAMPLE_BUILDING_ASSESSMENTS);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    SAMPLE_BUILDING_ASSESSMENTS[0]?.id ?? ""
  );

  const selectedAssessment: BuildingAssessmentRecord | undefined =
    assessments.find((a) => a.id === selectedAssessmentId) ?? assessments[0];

  const [evaluation, setEvaluation] = useState<ExpertEvaluationResult | null>(() => {
    const p = getDefaultProfile();
    const a = SAMPLE_BUILDING_ASSESSMENTS[0];
    return p && a ? InferenceEngine.evaluate(p, a) : null;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const p = profileRepository.getProfile() ?? getDefaultProfile();
      setProfile(p);
      const list = assessmentRepository.getAssessments();
      setAssessments(list);
      const activeAssessment = list.find((a) => a.id === selectedAssessmentId) ?? list[0];
      if (activeAssessment) {
        setEvaluation(InferenceEngine.evaluate(p, activeAssessment));
      }
    };
    handleUpdate();
    window.addEventListener("accessmate:profile-updated", handleUpdate);
    window.addEventListener("accessmate:assessments-updated", handleUpdate);
    return () => {
      window.removeEventListener("accessmate:profile-updated", handleUpdate);
      window.removeEventListener("accessmate:assessments-updated", handleUpdate);
    };
  }, [selectedAssessmentId]);

  const handleRunEvaluation = () => {
    if (!profile || !selectedAssessment) return;
    const result = InferenceEngine.evaluate(profile, selectedAssessment);
    setEvaluation(result);
  };

  const handleSelectPreset = (preset: ProfilePreset) => {
    const p: UserAccessibilityProfile = {
      id: preset.id,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...preset.data,
    };
    setProfile(p);
    if (selectedAssessment) {
      const result = InferenceEngine.evaluate(p, selectedAssessment);
      setEvaluation(result);
    }
  };

  const getOutcomeTheme = (outcome: AssessmentOutcome) => {
    switch (outcome) {
      case "suitable":
        return {
          badgeVariant: "success" as const,
          border: "border-emerald-300",
          bg: "bg-emerald-50/40",
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-700" />,
          accentText: "text-emerald-900",
        };
      case "suitable_with_arrangements":
        return {
          badgeVariant: "teal" as const,
          border: "border-teal-300",
          bg: "bg-teal-50/40",
          icon: <CheckCircle2 className="h-6 w-6 text-teal-700" />,
          accentText: "text-teal-900",
        };
      case "difficult":
        return {
          badgeVariant: "warning" as const,
          border: "border-amber-300",
          bg: "bg-amber-50/40",
          icon: <AlertTriangle className="h-6 w-6 text-amber-700" />,
          accentText: "text-amber-900",
        };
      case "unsuitable":
        return {
          badgeVariant: "error" as const,
          border: "border-rose-300",
          bg: "bg-rose-50/40",
          icon: <XCircle className="h-6 w-6 text-rose-700" />,
          accentText: "text-rose-900",
        };
      case "insufficient_information":
      default:
        return {
          badgeVariant: "neutral" as const,
          border: "border-zinc-300",
          bg: "bg-zinc-50/80",
          icon: <HelpCircle className="h-6 w-6 text-zinc-700" />,
          accentText: "text-zinc-900",
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111110] font-display">
            Expert Accessibility Assessment
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
            Cross-reference your personal accessibility profile against physical venue audits to detect micro-barriers and view transparent decision traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleRunEvaluation}
            leftIcon={<Cpu className="h-4 w-4" />}
            disabled={!selectedAssessment}
          >
            Re-evaluate
          </Button>
        </div>
      </div>

      {/* Selectors Inset Card (Profile & Building) */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-xs space-y-4">
        <div className="pb-3 border-b border-black/[0.04]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
            Evaluation Setup
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select the profile requirements and target building audit to evaluate.
          </p>
        </div>
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Profile Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="profile-select" className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-zinc-500" />
                  Active User Profile
                </label>
                <Link href="/profile" className="text-xs text-teal-700 hover:text-teal-800 font-medium">
                  Edit Profile &rarr;
                </Link>
              </div>

              <div className="rounded-xl border border-black/[0.06] bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 font-semibold flex items-center justify-between">
                <span>{profile.name}</span>
                <span className="text-[11px] text-zinc-500 font-mono capitalize">{profile.preferredCategory.replace(/_/g, " ")}</span>
              </div>

              {/* Persona Quick Presets */}
              <div className="pt-1">
                <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                  Test a persona:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROFILE_PRESETS.map((preset: ProfilePreset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer select-none ${
                        profile.id === preset.id
                          ? "bg-[#111110] text-white font-medium shadow-2xs"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Building Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="building-select" className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  Target Building Audit
                </label>
                {selectedAssessment && (
                  <Link href="/assessment" className="text-xs text-teal-700 hover:text-teal-800 font-medium">
                    View Audit &rarr;
                  </Link>
                )}
              </div>

              <select
                id="building-select"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 shadow-2xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.general.name} ({a.general.buildingType.replace(/_/g, " ")}) — {a.general.floorsCount} {a.general.floorsCount === 1 ? "floor" : "floors"}
                  </option>
                ))}
              </select>

              {selectedAssessment && (
                <div className="text-[11px] text-zinc-500 pt-1 flex items-center justify-between font-mono">
                  <span>Audited: {selectedAssessment.general.assessmentDate}</span>
                  <span className="text-zinc-600 truncate max-w-[200px]">{selectedAssessment.general.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Results View */}
      {evaluation ? (
        <div className="space-y-6">
          {/* 1. Overall Synthesis Banner */}
          {(() => {
            const theme = getOutcomeTheme(evaluation.overallOutcome);
            return (
              <div
                className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 sm:p-7 shadow-xs relative overflow-hidden`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={theme.badgeVariant} size="md">
                        {evaluation.overallOutcome.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-zinc-500">
                        {evaluation.rulesEvaluatedCount} rules evaluated &bull; {evaluation.rulesFiredCount} fired
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      {theme.icon}
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                        {evaluation.outcomeTitle}
                      </h2>
                    </div>

                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {evaluation.outcomeDescription}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-4 text-xs text-zinc-600">
                      <div>
                        <span className="font-semibold text-zinc-900">User Profile: </span>
                        {evaluation.profileName}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-900">Audited Venue: </span>
                        {evaluation.placeName}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 gap-2.5 min-w-[240px] bg-white p-3.5 rounded-lg border border-zinc-200/90 shadow-2xs">
                    <div className="p-2.5 bg-zinc-50 rounded-md text-center">
                      <span className="text-[11px] font-semibold uppercase text-zinc-500 block">Needs</span>
                      <span className="text-xl font-bold text-zinc-900 tabular-nums">
                        {evaluation.essentialRequirements.total}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-md text-center">
                      <span className="text-[11px] font-semibold uppercase text-emerald-800 block">Satisfied</span>
                      <span className="text-xl font-bold text-emerald-800 tabular-nums">
                        {evaluation.essentialRequirements.satisfiedCount}
                      </span>
                    </div>
                    <div className="p-2.5 bg-rose-50 rounded-md text-center">
                      <span className="text-[11px] font-semibold uppercase text-rose-800 block">Barriers</span>
                      <span className="text-xl font-bold text-rose-800 tabular-nums">
                        {evaluation.barriers.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-md text-center">
                      <span className="text-[11px] font-semibold uppercase text-amber-800 block">Info Gaps</span>
                      <span className="text-xl font-bold text-amber-800 tabular-nums">
                        {evaluation.informationGaps.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. Critical & High Barriers (if any) */}
          {evaluation.barriers.length > 0 && (
            <CollapsibleSection
              title={`Detected Barriers (${evaluation.barriers.length})`}
              description="Physical or environmental conditions that conflict with your functional requirements."
              icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}
              badge={`${evaluation.barriers.length} Found`}
              defaultOpen={true}
            >
              <div className="space-y-3 pt-1">
                {evaluation.barriers.map((barrier) => {
                  const isCritical = barrier.severity === "critical";
                  const isResolved = barrier.isResolvedByArrangement;
                  return (
                    <div
                      key={barrier.id}
                      className={`p-4 rounded-lg border ${
                        isResolved
                          ? "bg-teal-50/40 border-teal-200"
                          : isCritical
                          ? "bg-rose-50/40 border-rose-200"
                          : "bg-amber-50/30 border-amber-200"
                      } space-y-2`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              isResolved ? "teal" : isCritical ? "error" : "warning"
                            }
                            size="sm"
                          >
                            {isResolved ? "Resolved By Arrangement" : barrier.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            {barrier.impactedDimension}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">Rule: {barrier.ruleId}</span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900">{barrier.title}</h4>
                      <p className="text-xs text-zinc-700 leading-relaxed">{barrier.description}</p>

                      {barrier.recommendedAction && (
                        <div className="pt-1 text-xs text-zinc-800 flex items-start gap-1.5 bg-white p-2.5 rounded-md border border-zinc-200/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-teal-900">Recommended Action: </span>
                            {barrier.recommendedAction}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 3. Accessibility Strengths */}
          {evaluation.strengths.length > 0 && (
            <CollapsibleSection
              title={`Accessibility Strengths (${evaluation.strengths.length})`}
              description="Features that facilitate access or provide assistive accommodations."
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              badge={`${evaluation.strengths.length} Present`}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {evaluation.strengths.map((strength) => (
                  <div
                    key={strength.id}
                    className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="success" size="sm">
                        Verified Feature
                      </Badge>
                      <span className="text-xs font-mono text-zinc-400">Rule: {strength.ruleId}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-900">{strength.title}</h4>
                    <p className="text-xs text-zinc-700 leading-relaxed">{strength.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 4. Information Gaps & Uncertainty */}
          {evaluation.informationGaps.length > 0 && (
            <CollapsibleSection
              title={`Information Gaps &amp; Uncertainty (${evaluation.informationGaps.length})`}
              description="Unmeasured or missing features critical to your profile requirements. Never assumed present."
              icon={<HelpCircle className="h-4 w-4 text-amber-600" />}
              badge={`${evaluation.informationGaps.length} Unmeasured`}
              defaultOpen={true}
            >
              <div className="space-y-3 pt-1">
                <Alert variant="warning">
                  <AlertTitle>Uncertainty Principle</AlertTitle>
                  <AlertDescription>
                    ACCESSMATE strictly treats unknown values as unmeasured rather than assuming availability.
                    The following attributes require physical verification before relying upon them.
                  </AlertDescription>
                </Alert>

                {evaluation.informationGaps.map((gap) => (
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
                    <h4 className="text-sm font-semibold text-zinc-900">{gap.feature}</h4>
                    <p className="text-xs text-zinc-700">{gap.whyNeeded}</p>
                    <div className="text-xs text-amber-900 bg-white p-2 rounded-md border border-amber-200/60">
                      <span className="font-semibold">How to Verify: </span>
                      {gap.recommendedVerification}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 5. Evidence Conflicts (if any) */}
          {evaluation.evidenceConflicts.length > 0 && (
            <CollapsibleSection
              title={`Evidence Conflicts (${evaluation.evidenceConflicts.length})`}
              description="Contradictory physical observations identified in the survey record."
              icon={<ShieldAlert className="h-4 w-4 text-rose-600" />}
              badge="Contradiction"
              defaultOpen={true}
            >
              <div className="space-y-3 pt-1">
                {evaluation.evidenceConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-4 rounded-lg border border-rose-300 bg-rose-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="error" size="sm">
                        Conflicting Evidence
                      </Badge>
                      <span className="text-xs font-mono text-zinc-400">Rule: {conflict.ruleId}</span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900">{conflict.feature}</h4>
                    <p className="text-xs text-zinc-700">{conflict.description}</p>
                    <div className="text-xs text-rose-900 bg-white p-2 rounded-md border border-rose-200">
                      <span className="font-semibold">Recommendation: </span>
                      {conflict.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 6. Practical Recommended Actions */}
          {evaluation.recommendations.length > 0 && (
            <CollapsibleSection
              title={`Recommended Actions (${evaluation.recommendations.length})`}
              description="Concrete, prioritized next steps synthesized from barriers and information gaps."
              icon={<CheckCircle2 className="h-4 w-4 text-teal-700" />}
              defaultOpen={true}
            >
              <div className="space-y-2.5 pt-1">
                {evaluation.recommendations.map((rec, index) => {
                  const isCritical = rec.priority === "critical";
                  const isHigh = rec.priority === "high";
                  return (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors shadow-2xs"
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCritical
                            ? "bg-rose-100 text-rose-800"
                            : isHigh
                            ? "bg-amber-100 text-amber-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-zinc-900">{rec.title}</h4>
                          <Badge
                            variant={
                              isCritical ? "error" : isHigh ? "warning" : "teal"
                            }
                            size="sm"
                          >
                            {rec.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* 7. Full Explainable Decision Trace */}
          <CollapsibleSection
            title={`Explainable Rule Trace (${evaluation.explanationTraces.length} Fired Rules)`}
            description="Complete transparent audit trail: which rules fired, which conditions matched, and why."
            icon={<Cpu className="h-4 w-4 text-zinc-700" />}
            defaultOpen={false}
          >
            <div className="space-y-3 pt-1 font-mono text-xs">
              {evaluation.explanationTraces.map((trace) => (
                <div
                  key={`${trace.ruleId}-${trace.firedSequence}`}
                  className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/70 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-bold text-[11px]">
                        #{trace.firedSequence}
                      </span>
                      <span className="font-semibold text-zinc-900">{trace.ruleId}: {trace.ruleName}</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {trace.category}
                    </Badge>
                  </div>

                  {/* Conditions */}
                  {trace.conditionsEvaluated.length > 0 && (
                    <div className="space-y-1 bg-white p-2.5 rounded-md border border-zinc-200">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Conditions Evaluated
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-zinc-700">
                        {trace.conditionsEvaluated.map((cond, i) => (
                          <li key={i}>{cond}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Matched Facts */}
                  {trace.factsMatched.length > 0 && (
                    <div className="space-y-1 bg-white p-2.5 rounded-md border border-zinc-200">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Matched Facts from Working Memory
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {trace.factsMatched.map((fact, i) => (
                          <div key={i} className="text-[11px] p-1.5 rounded bg-zinc-50 border border-zinc-100">
                            <span className="text-teal-700 font-medium">{fact.attribute}: </span>
                            <span className="text-zinc-900 font-bold">{String(fact.value)} </span>
                            <span className="text-[10px] text-zinc-400">({fact.evidenceStatus})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion */}
                  <div className="p-2.5 rounded-md bg-teal-50/60 border border-teal-200/80 text-teal-900">
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">Conclusion</span>
                    {trace.conclusion}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          title="Ready for Expert Evaluation"
          description="Select an accessibility profile and a physical building audit above, then click 'Run Assessment' to evaluate environmental compatibility."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={handleRunEvaluation}
              leftIcon={<Cpu className="h-4 w-4" />}
              disabled={!selectedAssessment}
            >
              Run Assessment
            </Button>
          }
          icon={<Cpu className="h-6 w-6 text-zinc-700" />}
        />
      )}
    </div>
  );
}
