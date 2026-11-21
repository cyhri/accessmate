/**
 * Expert Inference Engine Types
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { CompatibilityStatus, BarrierSeverity } from "../constants";

export interface WorkingFact {
  readonly id: string;
  readonly category: string;
  readonly attribute: string;
  readonly value: string | number | boolean | readonly string[];
  readonly source: "profile" | "place_audit" | "inferred";
  readonly confidence: number; // 0.0 to 1.0
}

export interface Barrier {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: BarrierSeverity;
  readonly impactedDimension: string;
  readonly ruleId: string;
  readonly practicalRecommendation?: string;
}

export interface MatchedRequirement {
  readonly requirementKey: string;
  readonly facilityFeature: string;
  readonly note: string;
}

export interface ExplanationTrace {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly rationale: string;
  readonly firedConditions: readonly string[];
  readonly conclusion: string;
}

export interface InferenceEvaluationResult {
  readonly evaluationId: string;
  readonly profileId: string;
  readonly placeId: string;
  readonly overallStatus: CompatibilityStatus;
  readonly scorePercentage: number;
  readonly barriers: readonly Barrier[];
  readonly matches: readonly MatchedRequirement[];
  readonly explanations: readonly ExplanationTrace[];
  readonly uncertaintyWarnings: readonly string[];
  readonly evaluatedAt: string;
}
