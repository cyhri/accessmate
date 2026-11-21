/**
 * Conflict Resolver
 * Resolves contradictory observations and applies barrier-mitigation arrangements.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { EvaluatedBarrier, WorkingFact } from "../types.ts";

export class ConflictResolver {
  /**
   * Evaluates barriers against derived arrangements in Working Memory.
   * If an alternative arrangement resolves a barrier, marks it resolved.
   */
  static resolveBarriers(
    barriers: readonly EvaluatedBarrier[],
    workingMemory: ReadonlyMap<string, WorkingFact>
  ): EvaluatedBarrier[] {
    const isStepFreeResolved =
      workingMemory.get("derived:mobility:step_free_resolved_by_arrangement")?.value === true;

    return barriers.map((b) => {
      // Check if entrance barrier is resolved by verified alternative entrance
      if (b.ruleId === "MOB-001" && isStepFreeResolved) {
        return {
          ...b,
          isResolvedByArrangement: true,
          resolvingArrangement:
            "A verified alternative step-free entrance is available to bypass the entrance steps.",
        };
      }
      return b;
    });
  }
}
