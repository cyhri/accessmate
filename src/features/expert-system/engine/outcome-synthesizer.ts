/**
 * Outcome Synthesizer
 * Formulates the 5-tier classification based on barrier severity, verified arrangements, and evidence gaps.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { AssessmentOutcome } from "../../../constants/index.ts";
import type {
  EvaluatedBarrier,
  InformationGap,
  EvidenceConflict,
  WorkingFact,
} from "../types.ts";

export interface OutcomeSynthesis {
  readonly overallOutcome: AssessmentOutcome;
  readonly outcomeTitle: string;
  readonly outcomeDescription: string;
  readonly essentialRequirements: {
    readonly total: number;
    readonly satisfiedCount: number;
    readonly unmetCount: number;
    readonly unknownCount: number;
  };
}

export class OutcomeSynthesizer {
  static synthesize(
    barriers: readonly EvaluatedBarrier[],
    informationGaps: readonly InformationGap[],
    evidenceConflicts: readonly EvidenceConflict[],
    workingMemory: ReadonlyMap<string, WorkingFact>
  ): OutcomeSynthesis {
    // 1. Calculate essential requirements statistics
    let essentialTotal = 0;
    let essentialUnmet = 0;
    let essentialUnknown = 0;

    for (const [key, fact] of workingMemory.entries()) {
      if (key.startsWith("req:") && fact.value === "essential") {
        essentialTotal++;
      }
    }

    // Unresolved critical barriers
    const unresolvedCriticalBarriers = barriers.filter(
      (b) => b.severity === "critical" && !b.isResolvedByArrangement
    );

    // Resolved critical barriers
    const resolvedCriticalBarriers = barriers.filter(
      (b) => b.severity === "critical" && b.isResolvedByArrangement
    );

    // High & medium barriers
    const nonCriticalBarriers = barriers.filter(
      (b) => b.severity !== "critical" && !b.isResolvedByArrangement
    );

    essentialUnmet = unresolvedCriticalBarriers.length;
    essentialUnknown = informationGaps.length;

    const essentialSatisfied = Math.max(
      0,
      essentialTotal - essentialUnmet - essentialUnknown
    );

    // 2. Determine Outcome Tier
    // Tier 1: Unresolved critical barrier confirmed -> UNSUITABLE
    if (unresolvedCriticalBarriers.length > 0) {
      return {
        overallOutcome: "unsuitable",
        outcomeTitle: "Unsuitable for Stated Requirements",
        outcomeDescription:
          "Confirmed critical architectural barriers prevent independent or safe access for this individual's essential requirements.",
        essentialRequirements: {
          total: essentialTotal,
          satisfiedCount: essentialSatisfied,
          unmetCount: essentialUnmet,
          unknownCount: essentialUnknown,
        },
      };
    }

    // Tier 2: Unresolved critical conflicts or critical info gaps -> INSUFFICIENT_INFORMATION
    // If critical requirement data is missing or contradicted, we must NEVER claim the building is suitable!
    if (evidenceConflicts.length > 0 || informationGaps.length > 0) {
      return {
        overallOutcome: "insufficient_information",
        outcomeTitle: "Insufficient Information for Confident Assessment",
        outcomeDescription:
          "One or more essential accessibility features have unknown or conflicting survey data. Suitability cannot be confirmed until verified on-site.",
        essentialRequirements: {
          total: essentialTotal,
          satisfiedCount: essentialSatisfied,
          unmetCount: essentialUnmet,
          unknownCount: essentialUnknown,
        },
      };
    }

    // Tier 3: Critical barriers resolved through verified arrangements -> SUITABLE_WITH_ARRANGEMENTS
    if (resolvedCriticalBarriers.length > 0) {
      return {
        overallOutcome: "suitable_with_arrangements",
        outcomeTitle: "Suitable with Assistance or Arrangements",
        outcomeDescription:
          "Facility access is feasible provided designated alternative entrances, staff assistance, or key arrangements are utilized.",
        essentialRequirements: {
          total: essentialTotal,
          satisfiedCount: essentialSatisfied,
          unmetCount: 0,
          unknownCount: 0,
        },
      };
    }

    // Tier 4: Non-critical barriers (preferred needs unmet, moderate friction) -> DIFFICULT
    if (nonCriticalBarriers.length > 0) {
      return {
        overallOutcome: "difficult",
        outcomeTitle: "Difficult / Significant Barriers Present",
        outcomeDescription:
          "Essential physical ingress is possible, but noticeable barriers or fatigue-inducing conditions will be encountered.",
        essentialRequirements: {
          total: essentialTotal,
          satisfiedCount: essentialSatisfied,
          unmetCount: 0,
          unknownCount: 0,
        },
      };
    }

    // Tier 5: All essential requirements verified met with zero barriers -> SUITABLE
    return {
      overallOutcome: "suitable",
      outcomeTitle: "Suitable Based on Available Information",
      outcomeDescription:
        "The physical facility satisfies all stated accessibility requirements with reliable verified audit evidence.",
      essentialRequirements: {
        total: essentialTotal,
        satisfiedCount: essentialTotal,
        unmetCount: 0,
        unknownCount: 0,
      },
    };
  }
}
