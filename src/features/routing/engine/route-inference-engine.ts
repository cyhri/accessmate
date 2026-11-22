/**
 * Route Inference Engine
 * Forward-chaining evaluation of personalized accessibility compatibility for pedestrian route plans.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System (Phase 5)
 */

import type { UserAccessibilityProfile } from "../../../types/profile.ts";
import type { AssessmentOutcome } from "../../../constants/index.ts";
import type {
  FullRoutePlan,
  RouteAssessmentResult,
} from "../types.ts";
import type {
  EvaluatedBarrier,
  EvaluatedStrength,
  InformationGap,
  EvidenceConflict,
  ExplanationTraceItem,
  RecommendedActionItem,
} from "../../expert-system/types.ts";
import { ROUTE_KNOWLEDGE_RULES } from "../rules/route-rules.ts";

export class RouteInferenceEngine {
  /**
   * Evaluates a user accessibility profile against an evaluated route plan.
   */
  static evaluate(
    profile: UserAccessibilityProfile,
    route: FullRoutePlan
  ): RouteAssessmentResult {
    const firedRuleIds = new Set<string>();
    const barriers: EvaluatedBarrier[] = [];
    const strengths: EvaluatedStrength[] = [];
    const informationGaps: InformationGap[] = [];
    const evidenceConflicts: EvidenceConflict[] = [];
    const traces: ExplanationTraceItem[] = [];

    // Sort rules deterministically by priority descending, then by rule ID
    const sortedRules = [...ROUTE_KNOWLEDGE_RULES].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.id.localeCompare(b.id);
    });

    let sequence = 1;

    for (const rule of sortedRules) {
      if (firedRuleIds.has(rule.id)) continue;

      const conclusion = rule.evaluate(profile, route);
      if (!conclusion) continue;

      firedRuleIds.add(rule.id);

      // Record explanation trace
      traces.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        conditionsEvaluated: [rule.description],
        factsMatched: [
          {
            factKey: `route:distance:meters`,
            attribute: "distance_meters",
            value: route.distanceMeters,
            evidenceStatus: "verified",
          },
          {
            factKey: `route:incline:max_percent`,
            attribute: "max_incline_percent",
            value: route.characteristics.maxInclinePercent,
            evidenceStatus: route.characteristics.unknownInclinePercent > 50 ? "unknown" : "verified",
          },
          {
            factKey: `route:steps:count`,
            attribute: "known_steps_count",
            value: route.characteristics.knownStepsCount,
            evidenceStatus: route.characteristics.hasKnownSteps ? "verified" : "user_reported",
          },
        ],
        conclusion: conclusion.summaryNote,
        recommendedAction:
          conclusion.barrier?.recommendedAction ??
          conclusion.informationGap?.recommendedVerification ??
          conclusion.evidenceConflict?.recommendedAction,
        firedSequence: sequence++,
      });

      if (conclusion.barrier) {
        barriers.push({
          id: `route-barrier-${rule.id}-${sequence}`,
          ruleId: rule.id,
          title: conclusion.barrier.title,
          description: conclusion.barrier.description,
          severity: conclusion.barrier.severity,
          impactedDimension: conclusion.barrier.impactedDimension,
          evidenceStatus: "verified",
          isResolvedByArrangement: false,
          recommendedAction: conclusion.barrier.recommendedAction,
        });
      }

      if (conclusion.strength) {
        strengths.push({
          id: `route-strength-${rule.id}-${sequence}`,
          ruleId: rule.id,
          title: conclusion.strength.title,
          description: conclusion.strength.description,
          dimension: conclusion.strength.dimension,
          evidenceStatus: "verified",
        });
      }

      if (conclusion.informationGap) {
        informationGaps.push({
          id: `route-gap-${rule.id}-${sequence}`,
          ruleId: rule.id,
          feature: conclusion.informationGap.feature,
          dimension: conclusion.informationGap.dimension,
          whyNeeded: conclusion.informationGap.whyNeeded,
          recommendedVerification: conclusion.informationGap.recommendedVerification,
        });
      }

      if (conclusion.evidenceConflict) {
        evidenceConflicts.push({
          id: `route-conflict-${rule.id}-${sequence}`,
          ruleId: rule.id,
          feature: conclusion.evidenceConflict.feature,
          description: conclusion.evidenceConflict.description,
          conflictingSources: conclusion.evidenceConflict.conflictingSources,
          recommendedAction: conclusion.evidenceConflict.recommendedAction,
        });
      }
    }

    // Synthesize Essential Requirements Statistics
    let essentialTotal = 0;
    if (profile.mobility.requiresStepFreeAccess === "essential" || profile.mobility.usesWheelchair) essentialTotal++;
    if (profile.mobility.maxRampSlopePercent !== null) essentialTotal++;
    if (profile.mobility.maxWalkingDistanceMeters !== null) essentialTotal++;
    if (profile.vision.requiresTactileGroundPaving === "essential") essentialTotal++;

    const criticalBarriers = barriers.filter((b) => b.severity === "critical");
    const nonCriticalBarriers = barriers.filter((b) => b.severity !== "critical");

    let overallOutcome: AssessmentOutcome = "suitable";
    let outcomeTitle = "Suitable Based on Available Route Data";
    let outcomeDescription =
      "This pedestrian pathway matches your stated accessibility requirements with no confirmed physical barriers in OpenStreetMap.";

    // 5-Tier Route Outcome Formulation
    // Tier 1: Confirmed Critical Barrier -> UNSUITABLE
    if (criticalBarriers.length > 0) {
      overallOutcome = "unsuitable";
      outcomeTitle = "Unsuitable for Stated Mobility Requirements";
      outcomeDescription =
        "Confirmed critical barriers (such as stairs or severe inclines) prevent safe or independent transit along this route.";
    }
    // Tier 2: Information Gaps on Essential Attributes -> INSUFFICIENT_INFORMATION
    else if (informationGaps.length > 0 || evidenceConflicts.length > 0) {
      overallOutcome = "insufficient_information";
      outcomeTitle = "Insufficient Route Data for Confident Assessment";
      outcomeDescription =
        "Essential path features (surface roughness or elevation) have missing data in OpenStreetMap. Route suitability cannot be certified without verification.";
    }
    // Tier 3: Critical Barrier with Alternative Available -> SUITABLE_WITH_ARRANGEMENTS
    else if (route.isAlternative) {
      overallOutcome = "suitable_with_arrangements";
      outcomeTitle = "Suitable with Route Deviations";
      outcomeDescription =
        "This alternative corridor avoids primary street barriers but may require slightly longer travel time.";
    }
    // Tier 4: Moderate/Preferred Friction -> DIFFICULT
    else if (nonCriticalBarriers.length > 0) {
      overallOutcome = "difficult";
      outcomeTitle = "Difficult / Moderate Barriers Present";
      outcomeDescription =
        "Transit is physically possible, but you will encounter fatigue-inducing inclines, rough surfaces, or preferred criteria unmet.";
    }

    const unmetCount = criticalBarriers.length;
    const unknownCount = informationGaps.length;
    const satisfiedCount = Math.max(0, essentialTotal - unmetCount - unknownCount);

    // Generate Prioritized Recommendations
    const recommendations: RecommendedActionItem[] = [];

    // 1. Critical Barriers
    for (const b of criticalBarriers) {
      if (b.recommendedAction) {
        recommendations.push({
          id: `rec-route-${b.id}`,
          priority: "critical",
          title: `Avoid Route Barrier: ${b.title}`,
          description: b.recommendedAction,
          category: "Barrier Avoidance",
          linkedRuleId: b.ruleId,
        });
      }
    }

    // 2. Information Gaps
    for (const gap of informationGaps) {
      recommendations.push({
        id: `rec-route-${gap.id}`,
        priority: "high",
        title: `Verify Feature: ${gap.feature}`,
        description: gap.recommendedVerification,
        category: "Pre-Travel Verification",
        linkedRuleId: gap.ruleId,
      });
    }

    // 3. Moderate Barriers
    for (const b of nonCriticalBarriers) {
      if (b.recommendedAction) {
        recommendations.push({
          id: `rec-route-${b.id}`,
          priority: b.severity === "high" ? "high" : "medium",
          title: `Prepare for: ${b.title}`,
          description: b.recommendedAction,
          category: "Travel Preparation",
          linkedRuleId: b.ruleId,
        });
      }
    }

    // General transparency recommendation
    recommendations.push({
      id: `rec-route-general-transparency`,
      priority: "low",
      title: "Exercise Caution with Crowdsourced Data",
      description:
        "OpenStreetMap pedestrian data changes with urban construction. Always maintain a backup route plan.",
      category: "Travel Advisory",
      linkedRuleId: "GENERAL",
    });

    return {
      routeId: route.id,
      profileId: profile.id,
      profileName: profile.name,
      overallOutcome,
      outcomeTitle,
      outcomeDescription,
      essentialRequirements: {
        total: essentialTotal,
        satisfiedCount,
        unmetCount,
        unknownCount,
      },
      barriers,
      strengths,
      informationGaps,
      evidenceConflicts,
      explanationTraces: traces,
      recommendations,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
