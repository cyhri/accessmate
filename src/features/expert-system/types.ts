/**
 * Expert Inference Engine Type Contracts
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { EvidenceStatus, BarrierSeverity, AssessmentOutcome } from "../../constants/index.ts";

export type FactCategory =
  | "mobility"
  | "elevator"
  | "restroom"
  | "vision"
  | "hearing"
  | "stamina"
  | "sensory"
  | "temporary"
  | "general"
  | "derived";

/**
 * Normalized fact inside Working Memory.
 */
export interface WorkingFact {
  readonly key: string;
  readonly category: FactCategory;
  readonly attribute: string;
  readonly value: boolean | number | string | null;
  readonly evidenceStatus: EvidenceStatus;
  readonly source: "profile" | "place_audit" | "derived";
  readonly notes?: string;
  readonly provenance?: string;
}

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "less_than"
  | "greater_than"
  | "less_than_or_equal"
  | "greater_than_or_equal"
  | "is_true"
  | "is_false"
  | "is_null"
  | "is_not_null"
  | "in"
  | "not_in";

export interface RuleCondition {
  readonly factKey: string;
  readonly operator: ConditionOperator;
  readonly expectedValue?: boolean | number | string | readonly (string | number)[];
  readonly requiredEvidenceStatus?: readonly EvidenceStatus[];
  readonly description: string;
}

export interface RuleConclusion {
  readonly barrier?: {
    readonly title: string;
    readonly description: string;
    readonly severity: BarrierSeverity;
    readonly impactedDimension: string;
    readonly recommendedAction?: string;
  };
  readonly strength?: {
    readonly title: string;
    readonly description: string;
    readonly dimension: string;
  };
  readonly informationGap?: {
    readonly feature: string;
    readonly dimension: string;
    readonly whyNeeded: string;
    readonly recommendedVerification: string;
  };
  readonly evidenceConflict?: {
    readonly feature: string;
    readonly description: string;
    readonly conflictingSources: readonly string[];
    readonly recommendedAction: string;
  };
  readonly derivedFact?: {
    readonly key: string;
    readonly category: FactCategory;
    readonly attribute: string;
    readonly value: boolean | number | string | null;
    readonly evidenceStatus: EvidenceStatus;
    readonly notes?: string;
  };
  readonly summaryNote: string;
}

export interface KnowledgeRule {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly priority: number; // Higher number fires first
  readonly conditions: readonly RuleCondition[];
  readonly evaluate: (workingMemory: ReadonlyMap<string, WorkingFact>) => RuleConclusion | null;
}

export interface EvaluatedBarrier {
  readonly id: string;
  readonly ruleId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: BarrierSeverity;
  readonly impactedDimension: string;
  readonly evidenceStatus: EvidenceStatus;
  readonly isResolvedByArrangement: boolean;
  readonly resolvingArrangement?: string;
  readonly recommendedAction?: string;
}

export interface EvaluatedStrength {
  readonly id: string;
  readonly ruleId: string;
  readonly title: string;
  readonly description: string;
  readonly dimension: string;
  readonly evidenceStatus: EvidenceStatus;
}

export interface InformationGap {
  readonly id: string;
  readonly ruleId: string;
  readonly feature: string;
  readonly dimension: string;
  readonly whyNeeded: string;
  readonly recommendedVerification: string;
}

export interface EvidenceConflict {
  readonly id: string;
  readonly ruleId: string;
  readonly feature: string;
  readonly description: string;
  readonly conflictingSources: readonly string[];
  readonly recommendedAction: string;
}

export interface MatchedFactDetail {
  readonly factKey: string;
  readonly attribute: string;
  readonly value: unknown;
  readonly evidenceStatus: EvidenceStatus;
}

export interface ExplanationTraceItem {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly category: string;
  readonly conditionsEvaluated: readonly string[];
  readonly factsMatched: readonly MatchedFactDetail[];
  readonly conclusion: string;
  readonly recommendedAction?: string;
  readonly firedSequence: number;
}

export interface RecommendedActionItem {
  readonly id: string;
  readonly priority: "critical" | "high" | "medium" | "low";
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly linkedRuleId: string;
}

export interface ExpertEvaluationResult {
  readonly evaluationId: string;
  readonly profileId: string;
  readonly profileName: string;
  readonly placeId: string;
  readonly placeName: string;
  readonly overallOutcome: AssessmentOutcome;
  readonly outcomeTitle: string;
  readonly outcomeDescription: string;
  readonly essentialRequirements: {
    readonly total: number;
    readonly satisfiedCount: number;
    readonly unmetCount: number;
    readonly unknownCount: number;
  };
  readonly barriers: readonly EvaluatedBarrier[];
  readonly strengths: readonly EvaluatedStrength[];
  readonly informationGaps: readonly InformationGap[];
  readonly evidenceConflicts: readonly EvidenceConflict[];
  readonly explanationTraces: readonly ExplanationTraceItem[];
  readonly recommendations: readonly RecommendedActionItem[];
  readonly rulesEvaluatedCount: number;
  readonly rulesFiredCount: number;
  readonly evaluatedAt: string;
}
