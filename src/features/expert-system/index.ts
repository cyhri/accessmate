/**
 * Expert Inference Engine Feature Module
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export * from "./types.ts";
export { InferenceEngine } from "./engine/inference-engine.ts";
export { KNOWLEDGE_RULES } from "./knowledge-base/rules.ts";
export { FactExtractor } from "./working-memory/fact-extractor.ts";
export { WorkingMemory } from "./working-memory/working-memory.ts";
export { ConflictResolver } from "./engine/conflict-resolver.ts";
export { OutcomeSynthesizer } from "./engine/outcome-synthesizer.ts";
export { RecommendationEngine } from "./recommendations/recommendation-engine.ts";
