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
  Building2,
  UserCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
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

export default function AdminExpertAssessmentPage() {
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
          title: "Compatible & Step-Free Verified",
          description: "All physical accessibility requirements are fully verified for this facility.",
        };
      case "suitable_with_arrangements":
        return {
          badgeVariant: "teal" as const,
          border: "border-teal-300",
          bg: "bg-teal-50/40",
          icon: <CheckCircle2 className="h-6 w-6 text-teal-700" />,
          title: "Suitable with Prior Notice",
          description: "Facility is navigable, but certain assistive features require pre-arrangement.",
        };
      case "difficult":
        return {
          badgeVariant: "warning" as const,
          border: "border-amber-300",
          bg: "bg-amber-50/40",
          icon: <AlertTriangle className="h-6 w-6 text-amber-700" />,
          title: "Challenging / Moderate Barriers",
          description: "Significant physical barriers or slopes were identified that may restrict independence.",
        };
      case "unsuitable":
        return {
          badgeVariant: "error" as const,
          border: "border-rose-300",
          bg: "bg-rose-50/40",
          icon: <XCircle className="h-6 w-6 text-rose-700" />,
          title: "Incompatible / Inaccessible",
          description: "Critical physical barriers (e.g. entrance stairs with no ramp or broken elevator) prevent access.",
        };
      case "insufficient_information":
      default:
        return {
          badgeVariant: "neutral" as const,
          border: "border-zinc-300",
          bg: "bg-zinc-50/60",
          icon: <HelpCircle className="h-6 w-6 text-zinc-600" />,
          title: "Insufficient Evidence",
          description: "Crucial physical dimensions have not been surveyed or verified yet.",
        };
    }
  };

  const theme = evaluation ? getOutcomeTheme(evaluation.overallOutcome) : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
              Expert Assessment &amp; Inference Engine
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              Deterministic AI
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Execute deterministic forward-chaining rules against building audits to produce transparent, explainable compatibility verdicts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunEvaluation}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Re-Evaluate Rules</span>
        </button>
      </div>

      {/* Target Selectors: Profile Preset + Building Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Persona Profile Selection */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-teal-600" />
              <span>Target Accessibility Persona</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Active: {profile.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {PROFILE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  profile.id === preset.id
                    ? "bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs"
                    : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <div className="font-semibold text-xs leading-tight">{preset.name}</div>
                <div className="text-[10px] opacity-75 truncate mt-0.5">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Building Audit Selection */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Surveyed Facility Audit</span>
            </span>
            <Link
              href="/admin/assessments"
              className="text-[11px] font-semibold text-teal-700 hover:underline"
            >
              Manage Audits
            </Link>
          </div>

          <div className="space-y-1.5">
            {assessments.map((audit) => (
              <button
                key={audit.id}
                type="button"
                onClick={() => setSelectedAssessmentId(audit.id)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedAssessment?.id === audit.id
                    ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold shadow-xs"
                    : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{audit.general.name}</div>
                  <div className="text-[10px] text-zinc-500">{audit.general.address}</div>
                </div>
                <span className="text-[10px] font-mono opacity-60 shrink-0">
                  {audit.general.assessmentDate}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outcome Verdict Card */}
      {evaluation && theme && (
        <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-xs space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white shadow-xs flex items-center justify-center">
                {theme.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={theme.badgeVariant} size="sm">
                    {evaluation.overallOutcome.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-zinc-500">
                    Rules Evaluated: {evaluation.rulesEvaluatedCount}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 font-display mt-0.5">
                  {theme.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-black/[0.04] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                  Barriers
                </span>
                <span className="text-base font-bold text-rose-600 font-mono">
                  {evaluation.barriers.length}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                  Gaps
                </span>
                <span className="text-base font-bold text-amber-600 font-mono">
                  {evaluation.informationGaps.length}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                  Rules Fired
                </span>
                <span className="text-base font-bold text-indigo-600 font-mono">
                  {evaluation.rulesFiredCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-700 leading-relaxed">{theme.description}</p>
        </div>
      )}

      {/* Rules Fired & Transparent Reasoning Traces */}
      {evaluation && (
        <div className="space-y-4">
          {/* Barriers Breakdown */}
          {evaluation.barriers.length > 0 && (
            <div className="rounded-2xl border border-rose-200/80 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 font-mono">
                  Identified Physical Barriers ({evaluation.barriers.length})
                </h3>
              </div>
              <div className="space-y-2">
                {evaluation.barriers.map((barrier) => (
                  <div
                    key={barrier.id}
                    className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950">{barrier.title}</span>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {barrier.severity}
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">{barrier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Explanation Trace Log */}
          <CollapsibleSection title={`Transparent Reasoning Traces (${evaluation.explanationTraces.length})`} defaultOpen>
            <div className="space-y-2.5 pt-2">
              {evaluation.explanationTraces.map((trace) => (
                <div
                  key={`${trace.ruleId}-${trace.firedSequence}`}
                  className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5 font-mono"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-700">{trace.ruleId} &bull; {trace.ruleName}</span>
                    <span className="text-[10px] text-zinc-400">Step #{trace.firedSequence}</span>
                  </div>
                  <p className="text-zinc-700 font-sans text-xs">{trace.conclusion}</p>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200/80 text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-400 block font-semibold mb-0.5">EVALUATION CONDITIONS:</span>
                    {trace.conditionsEvaluated.join(" AND ")}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Recommendations */}
          {evaluation.recommendations.length > 0 && (
            <CollapsibleSection title={`Personalized Recommendations (${evaluation.recommendations.length})`} defaultOpen>
              <div className="space-y-2 pt-2">
                {evaluation.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/60 text-xs space-y-0.5"
                  >
                    <div className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                      <span>{rec.title}</span>
                    </div>
                    <p className="text-teal-900 text-[11px] leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
}
