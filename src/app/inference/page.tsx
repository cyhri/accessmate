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
  Sparkles,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { assessmentRepository } from "@/features/assessment";
import type { UserAccessibilityProfile } from "@/types/profile";
import type { BuildingAssessmentRecord } from "@/types/assessment";
import type { AssessmentOutcome } from "@/constants/index";

export default function InferencePage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(() => {
    if (typeof window === "undefined") {
      return getDefaultProfile();
    }
    return profileRepository.getProfile() ?? getDefaultProfile();
  });

  const [assessments, setAssessments] = useState<BuildingAssessmentRecord[]>(() => {
    if (typeof window === "undefined") return [];
    return assessmentRepository.getAssessments();
  });

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const list = assessmentRepository.getAssessments();
    return list.length > 0 && list[0] ? list[0].id : "";
  });

  const [evaluation, setEvaluation] = useState<ExpertEvaluationResult | null>(null);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile(profileRepository.getProfile() ?? getDefaultProfile());
    };
    const handleAssessmentsUpdate = () => {
      const updated = assessmentRepository.getAssessments();
      setAssessments(updated);
      if (updated.length > 0 && !updated.some((a) => a.id === selectedAssessmentId) && updated[0]) {
        setSelectedAssessmentId(updated[0].id);
      }
    };

    window.addEventListener("accessmate:profile-updated", handleProfileUpdate);
    window.addEventListener("accessmate:assessments-updated", handleAssessmentsUpdate);
    return () => {
      window.removeEventListener("accessmate:profile-updated", handleProfileUpdate);
      window.removeEventListener("accessmate:assessments-updated", handleAssessmentsUpdate);
    };
  }, [selectedAssessmentId]);

  const selectedAssessment: BuildingAssessmentRecord | undefined =
    assessments.find((a) => a.id === selectedAssessmentId) ?? assessments[0];

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
          bg: "bg-emerald-50/50",
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
          accentText: "text-emerald-800",
          barColor: "bg-emerald-600",
        };
      case "suitable_with_arrangements":
        return {
          badgeVariant: "teal" as const,
          border: "border-teal-300",
          bg: "bg-teal-50/50",
          icon: <CheckCircle2 className="h-6 w-6 text-teal-600" />,
          accentText: "text-teal-800",
          barColor: "bg-teal-600",
        };
      case "difficult":
        return {
          badgeVariant: "warning" as const,
          border: "border-amber-300",
          bg: "bg-amber-50/50",
          icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
          accentText: "text-amber-800",
          barColor: "bg-amber-600",
        };
      case "unsuitable":
        return {
          badgeVariant: "error" as const,
          border: "border-rose-300",
          bg: "bg-rose-50/50",
          icon: <XCircle className="h-6 w-6 text-rose-600" />,
          accentText: "text-rose-800",
          barColor: "bg-rose-600",
        };
      case "insufficient_information":
      default:
        return {
          badgeVariant: "neutral" as const,
          border: "border-slate-300",
          bg: "bg-slate-50/70",
          icon: <HelpCircle className="h-6 w-6 text-slate-600" />,
          accentText: "text-slate-800",
          barColor: "bg-slate-600",
        };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="sm" dot>
              Phase 4 Active
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Expert Decision-Support
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Explainable Expert Assessment
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Transparent forward-chaining rule evaluation comparing personal accessibility needs with physical built environment audits.
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
            Run Assessment
          </Button>
        </div>
      </div>

      {/* Selectors Card */}
      <Card className="border-teal-100 bg-white shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-teal-600" />
            Evaluation Inputs &amp; Working Memory Configuration
          </CardTitle>
          <CardDescription>
            Select which accessibility profile criteria and building physical audit to evaluate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Selection */}
            <div className="space-y-2">
              <label htmlFor="profile-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Target User Profile
              </label>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 font-medium">
                  {profile.name} ({profile.preferredCategory})
                </div>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="h-full">
                    Edit
                  </Button>
                </Link>
              </div>

              {/* Persona Quick Presets */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Or test with a persona preset:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROFILE_PRESETS.map((preset: ProfilePreset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        profile.id === preset.id
                          ? "bg-teal-600 text-white border-teal-600 font-semibold"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
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
              <label htmlFor="building-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Target Building Assessment
              </label>
              <select
                id="building-select"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.general.name} ({a.general.buildingType.replace(/_/g, " ")}) — {a.general.floorsCount} {a.general.floorsCount === 1 ? "floor" : "floors"}
                  </option>
                ))}
              </select>

              {selectedAssessment && (
                <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
                  <span>Audited: {selectedAssessment.general.assessmentDate}</span>
                  <Link href="/assessment" className="text-teal-700 hover:underline">
                    View Audit Details &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Results View */}
      {evaluation ? (
        <div className="space-y-6">
          {/* 1. Overall Synthesis Banner */}
          {(() => {
            const theme = getOutcomeTheme(evaluation.overallOutcome);
            return (
              <div
                className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 sm:p-8 shadow-xs relative overflow-hidden`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant={theme.badgeVariant} size="md">
                        {evaluation.overallOutcome.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-slate-500">
                        Evaluated {evaluation.rulesEvaluatedCount} Rules &bull; {evaluation.rulesFiredCount} Fired
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {theme.icon}
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {evaluation.outcomeTitle}
                      </h2>
                    </div>

                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {evaluation.outcomeDescription}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-4 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900">User: </span>
                        {evaluation.profileName}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Building: </span>
                        {evaluation.placeName}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 gap-3 min-w-[240px] bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs backdrop-blur-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                      <span className="text-xs font-semibold uppercase text-slate-500 block">Essential Needs</span>
                      <span className="text-2xl font-extrabold text-slate-900">
                        {evaluation.essentialRequirements.total}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg text-center">
                      <span className="text-xs font-semibold uppercase text-emerald-700 block">Satisfied</span>
                      <span className="text-2xl font-extrabold text-emerald-800">
                        {evaluation.essentialRequirements.satisfiedCount}
                      </span>
                    </div>
                    <div className="p-2.5 bg-rose-50 rounded-lg text-center">
                      <span className="text-xs font-semibold uppercase text-rose-700 block">Barriers</span>
                      <span className="text-2xl font-extrabold text-rose-800">
                        {evaluation.barriers.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg text-center">
                      <span className="text-xs font-semibold uppercase text-amber-700 block">Info Gaps</span>
                      <span className="text-2xl font-extrabold text-amber-800">
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
              icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
              badge={`${evaluation.barriers.length} Found`}
              defaultOpen={true}
            >
              <div className="space-y-3 pt-2">
                {evaluation.barriers.map((barrier) => {
                  const isCritical = barrier.severity === "critical";
                  const isResolved = barrier.isResolvedByArrangement;
                  return (
                    <div
                      key={barrier.id}
                      className={`p-4 rounded-xl border ${
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
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {barrier.impactedDimension}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">Rule: {barrier.ruleId}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{barrier.title}</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{barrier.description}</p>

                      {barrier.recommendedAction && (
                        <div className="pt-1 text-xs text-slate-800 flex items-start gap-1.5 bg-white/70 p-2.5 rounded-lg border border-slate-200/70">
                          <Sparkles className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
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
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              badge={`${evaluation.strengths.length} Present`}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {evaluation.strengths.map((strength) => (
                  <div
                    key={strength.id}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="success" size="sm">
                        Verified Feature
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">Rule: {strength.ruleId}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{strength.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{strength.description}</p>
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
              icon={<HelpCircle className="h-5 w-5 text-amber-600" />}
              badge={`${evaluation.informationGaps.length} Unmeasured`}
              defaultOpen={true}
            >
              <div className="space-y-3 pt-2">
                <Alert variant="warning">
                  <AlertTitle>Uncertainty Principle Enforcement</AlertTitle>
                  <AlertDescription>
                    ACCESSMATE strictly treats unknown values as unmeasured rather than assuming availability.
                    The following attributes require physical verification before relying upon them.
                  </AlertDescription>
                </Alert>

                {evaluation.informationGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="warning" size="sm">
                        Unmeasured Feature
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">Rule: {gap.ruleId}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{gap.feature}</h4>
                    <p className="text-xs text-slate-700">{gap.whyNeeded}</p>
                    <div className="text-xs text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200/60">
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
              icon={<ShieldAlert className="h-5 w-5 text-rose-600" />}
              badge="Contradiction"
              defaultOpen={true}
            >
              <div className="space-y-3 pt-2">
                {evaluation.evidenceConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="error" size="sm">
                        Conflicting Evidence
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">Rule: {conflict.ruleId}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{conflict.feature}</h4>
                    <p className="text-xs text-slate-700">{conflict.description}</p>
                    <div className="text-xs text-rose-900 bg-white/80 p-2 rounded-lg border border-rose-200">
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
              icon={<Sparkles className="h-5 w-5 text-teal-600" />}
              defaultOpen={true}
            >
              <div className="space-y-2.5 pt-2">
                {evaluation.recommendations.map((rec, index) => {
                  const isCritical = rec.priority === "critical";
                  const isHigh = rec.priority === "high";
                  return (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-200 transition-colors shadow-2xs"
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
                          <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                          <Badge
                            variant={
                              isCritical ? "error" : isHigh ? "warning" : "teal"
                            }
                            size="sm"
                          >
                            {rec.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
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
            icon={<Cpu className="h-5 w-5 text-slate-700" />}
            defaultOpen={false}
          >
            <div className="space-y-3 pt-2 font-mono text-xs">
              {evaluation.explanationTraces.map((trace) => (
                <div
                  key={`${trace.ruleId}-${trace.firedSequence}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white font-bold text-[11px]">
                        #{trace.firedSequence}
                      </span>
                      <span className="font-bold text-slate-900">{trace.ruleId}: {trace.ruleName}</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {trace.category}
                    </Badge>
                  </div>

                  {/* Conditions */}
                  {trace.conditionsEvaluated.length > 0 && (
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Conditions Evaluated
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {trace.conditionsEvaluated.map((cond, i) => (
                          <li key={i}>{cond}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Matched Facts */}
                  {trace.factsMatched.length > 0 && (
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Matched Facts from Working Memory
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {trace.factsMatched.map((fact, i) => (
                          <div key={i} className="text-[11px] p-1.5 rounded bg-slate-50 border border-slate-100">
                            <span className="text-teal-700 font-semibold">{fact.attribute}: </span>
                            <span className="text-slate-900 font-bold">{String(fact.value)} </span>
                            <span className="text-[10px] text-slate-400">({fact.evidenceStatus})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion */}
                  <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100 text-teal-900">
                    <span className="text-[10px] uppercase font-bold text-teal-700 block">Conclusion</span>
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
          description="Select an accessibility profile and a physical building audit above, then click 'Run Assessment' to trigger forward-chaining rule evaluation."
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
          icon={<Cpu className="h-8 w-8 text-teal-600" />}
        />
      )}
    </div>
  );
}
