/**
 * Forward-Chaining Inference Engine
 * Executes deterministic forward-chaining rule evaluation with loop safeguards and explanation generation.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { UserAccessibilityProfile } from "../../../types/profile.ts";
import type { BuildingAssessmentRecord } from "../../../types/assessment.ts";
import type {
  ExpertEvaluationResult,
  EvaluatedBarrier,
  EvaluatedStrength,
  InformationGap,
  EvidenceConflict,
  ExplanationTraceItem,
  MatchedFactDetail,
} from "../types.ts";
import { FactExtractor } from "../working-memory/fact-extractor.ts";
import { WorkingMemory } from "../working-memory/working-memory.ts";
import { KNOWLEDGE_RULES } from "../knowledge-base/rules.ts";
import { ConflictResolver } from "./conflict-resolver.ts";
import { OutcomeSynthesizer } from "./outcome-synthesizer.ts";
import { RecommendationEngine } from "../recommendations/recommendation-engine.ts";

export class InferenceEngine {
  /**
   * Evaluates a user profile against a building assessment to produce an explainable decision report.
   */
  static evaluate(
    profile: UserAccessibilityProfile,
    place: BuildingAssessmentRecord
  ): ExpertEvaluationResult {
    const initialFacts = FactExtractor.extract(profile, place);
    const wm = new WorkingMemory(initialFacts);

    const firedRuleIds = new Set<string>();
    const rawBarriers: EvaluatedBarrier[] = [];
    const strengths: EvaluatedStrength[] = [];
    const informationGaps: InformationGap[] = [];
    const evidenceConflicts: EvidenceConflict[] = [];
    const traces: ExplanationTraceItem[] = [];

    let sequence = 1;
    const MAX_ITERATIONS = 10;
    let iterations = 0;

    // Rules sorted deterministically by priority descending, then by ID
    const sortedRules = [...KNOWLEDGE_RULES].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.id.localeCompare(b.id);
    });

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      let newRuleFiredInIteration = false;

      for (const rule of sortedRules) {
        if (firedRuleIds.has(rule.id)) continue;

        const conclusion = rule.evaluate(wm.getAllFacts());
        if (!conclusion) continue;

        // Rule fired!
        firedRuleIds.add(rule.id);
        newRuleFiredInIteration = true;

        // 1. Collect matched facts for explanation trace
        const matchedFacts: MatchedFactDetail[] = [];
        for (const cond of rule.conditions) {
          const fact = wm.getFact(cond.factKey);
          if (fact) {
            matchedFacts.push({
              factKey: fact.key,
              attribute: fact.attribute,
              value: fact.value,
              evidenceStatus: fact.evidenceStatus,
            });
          }
        }

        // If no explicit conditions declared on rule, collect facts based on rule category
        if (matchedFacts.length === 0) {
          for (const fact of wm.getAllFacts().values()) {
            if (
              (rule.id.startsWith("MOB") && fact.key.includes("mobility")) ||
              (rule.id.startsWith("ELEV") && fact.key.includes("elevator")) ||
              (rule.id.startsWith("VIS") && fact.key.includes("vision")) ||
              (rule.id.startsWith("HEAR") && fact.key.includes("hearing")) ||
              (rule.id.startsWith("STAM") && fact.key.includes("stamina")) ||
              (rule.id.startsWith("SENS") && fact.key.includes("sensory"))
            ) {
              if (matchedFacts.length < 3) {
                matchedFacts.push({
                  factKey: fact.key,
                  attribute: fact.attribute,
                  value: fact.value,
                  evidenceStatus: fact.evidenceStatus,
                });
              }
            }
          }
        }

        // 2. Record explanation trace
        traces.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          conditionsEvaluated: rule.conditions.map((c) => c.description),
          factsMatched: matchedFacts,
          conclusion: conclusion.summaryNote,
          recommendedAction:
            conclusion.barrier?.recommendedAction ??
            conclusion.informationGap?.recommendedVerification ??
            conclusion.evidenceConflict?.recommendedAction,
          firedSequence: sequence++,
        });

        // 3. Process conclusions
        if (conclusion.barrier) {
          rawBarriers.push({
            id: `barrier-${rule.id}-${Date.now()}-${sequence}`,
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
            id: `strength-${rule.id}-${sequence}`,
            ruleId: rule.id,
            title: conclusion.strength.title,
            description: conclusion.strength.description,
            dimension: conclusion.strength.dimension,
            evidenceStatus: "verified",
          });
        }

        if (conclusion.informationGap) {
          informationGaps.push({
            id: `gap-${rule.id}-${sequence}`,
            ruleId: rule.id,
            feature: conclusion.informationGap.feature,
            dimension: conclusion.informationGap.dimension,
            whyNeeded: conclusion.informationGap.whyNeeded,
            recommendedVerification: conclusion.informationGap.recommendedVerification,
          });
        }

        if (conclusion.evidenceConflict) {
          evidenceConflicts.push({
            id: `conflict-${rule.id}-${sequence}`,
            ruleId: rule.id,
            feature: conclusion.evidenceConflict.feature,
            description: conclusion.evidenceConflict.description,
            conflictingSources: conclusion.evidenceConflict.conflictingSources,
            recommendedAction: conclusion.evidenceConflict.recommendedAction,
          });
        }

        if (conclusion.derivedFact) {
          wm.addDerivedFact({
            key: conclusion.derivedFact.key,
            category: conclusion.derivedFact.category,
            attribute: conclusion.derivedFact.attribute,
            value: conclusion.derivedFact.value,
            evidenceStatus: conclusion.derivedFact.evidenceStatus,
            source: "derived",
            notes: conclusion.derivedFact.notes,
          });
        }
      }

      // If no new rules fired in this cycle, forward-chaining has reached equilibrium
      if (!newRuleFiredInIteration) {
        break;
      }
    }

    // 4. Resolve conflicts & arrangements
    const resolvedBarriers = ConflictResolver.resolveBarriers(rawBarriers, wm.getAllFacts());

    // 5. Synthesize 5-tier outcome
    const synthesis = OutcomeSynthesizer.synthesize(
      resolvedBarriers,
      informationGaps,
      evidenceConflicts,
      wm.getAllFacts()
    );

    // 6. Generate practical next-step recommendations
    const recommendations = RecommendationEngine.generateRecommendations(
      resolvedBarriers,
      informationGaps,
      evidenceConflicts
    );

    return {
      evaluationId: `eval-${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      placeId: place.id,
      placeName: place.general.name,
      overallOutcome: synthesis.overallOutcome,
      outcomeTitle: synthesis.outcomeTitle,
      outcomeDescription: synthesis.outcomeDescription,
      essentialRequirements: synthesis.essentialRequirements,
      barriers: resolvedBarriers,
      strengths,
      informationGaps,
      evidenceConflicts,
      explanationTraces: traces,
      recommendations,
      rulesEvaluatedCount: sortedRules.length,
      rulesFiredCount: firedRuleIds.size,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
