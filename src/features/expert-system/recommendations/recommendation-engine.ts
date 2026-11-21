/**
 * Recommendation Engine
 * Synthesizes practical, high-value user next steps directly derived from detected barriers and information gaps.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type {
  EvaluatedBarrier,
  InformationGap,
  EvidenceConflict,
  RecommendedActionItem,
} from "../types.ts";

export class RecommendationEngine {
  /**
   * Generates prioritized, concrete recommendations linked directly to evaluation findings.
   */
  static generateRecommendations(
    barriers: readonly EvaluatedBarrier[],
    informationGaps: readonly InformationGap[],
    evidenceConflicts: readonly EvidenceConflict[]
  ): RecommendedActionItem[] {
    const actions: RecommendedActionItem[] = [];
    const seenTitles = new Set<string>();

    const addAction = (item: RecommendedActionItem) => {
      if (seenTitles.has(item.title.toLowerCase())) return;
      seenTitles.add(item.title.toLowerCase());
      actions.push(item);
    };

    // 1. Evidence Conflicts take high priority for physical verification
    for (const conflict of evidenceConflicts) {
      addAction({
        id: `rec-conflict-${conflict.id}`,
        priority: "critical",
        title: `Clarify Conflict: ${conflict.feature}`,
        description: conflict.recommendedAction,
        category: "Evidence Verification",
        linkedRuleId: conflict.ruleId,
      });
    }

    // 2. Unresolved Critical Barriers
    for (const barrier of barriers) {
      if (barrier.severity === "critical" && !barrier.isResolvedByArrangement && barrier.recommendedAction) {
        addAction({
          id: `rec-barrier-${barrier.id}`,
          priority: "critical",
          title: `Address Critical Barrier: ${barrier.title}`,
          description: barrier.recommendedAction,
          category: "Barrier Mitigation",
          linkedRuleId: barrier.ruleId,
        });
      }
    }

    // 3. Information Gaps on Essential Needs
    for (const gap of informationGaps) {
      addAction({
        id: `rec-gap-${gap.id}`,
        priority: "high",
        title: `Verify Feature: ${gap.feature}`,
        description: gap.recommendedVerification,
        category: "Pre-Visit Verification",
        linkedRuleId: gap.ruleId,
      });
    }

    // 4. Resolved Barriers with Alternative Arrangements
    for (const barrier of barriers) {
      if (barrier.isResolvedByArrangement) {
        addAction({
          id: `rec-resolved-${barrier.id}`,
          priority: "medium",
          title: `Use Designated Alternative Route`,
          description: barrier.resolvingArrangement ?? "Follow alternative entrance signage on-site.",
          category: "Alternative Arrangement",
          linkedRuleId: barrier.ruleId,
        });
      }
    }

    // 5. Remaining High & Medium Barriers
    for (const barrier of barriers) {
      if ((barrier.severity === "high" || barrier.severity === "medium") && !barrier.isResolvedByArrangement && barrier.recommendedAction) {
        addAction({
          id: `rec-barrier-${barrier.id}`,
          priority: barrier.severity === "high" ? "high" : "medium",
          title: `Mitigate: ${barrier.title}`,
          description: barrier.recommendedAction,
          category: "Travel Preparation",
          linkedRuleId: barrier.ruleId,
        });
      }
    }

    return actions;
  }
}
