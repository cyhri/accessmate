/**
 * Working Memory Store
 * Maintains normalized facts, derived conclusions, and supports conflict detection.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { WorkingFact } from "../types.ts";

export class WorkingMemory {
  private readonly facts: Map<string, WorkingFact>;
  private readonly derivedFactKeys: Set<string>;

  constructor(initialFacts: Map<string, WorkingFact>) {
    this.facts = new Map(initialFacts);
    this.derivedFactKeys = new Set();
  }

  getFact(key: string): WorkingFact | undefined {
    return this.facts.get(key);
  }

  hasFact(key: string): boolean {
    return this.facts.has(key);
  }

  getFactValue<T = unknown>(key: string): T | undefined {
    return this.facts.get(key)?.value as T | undefined;
  }

  addDerivedFact(fact: WorkingFact): boolean {
    const existing = this.facts.get(fact.key);
    if (existing && existing.value === fact.value && existing.evidenceStatus === fact.evidenceStatus) {
      return false; // No change
    }

    this.facts.set(fact.key, fact);
    this.derivedFactKeys.add(fact.key);
    return true;
  }

  getAllFacts(): ReadonlyMap<string, WorkingFact> {
    return this.facts;
  }

  getFactsByCategory(category: string): WorkingFact[] {
    const matched: WorkingFact[] = [];
    for (const fact of this.facts.values()) {
      if (fact.category === category) {
        matched.push(fact);
      }
    }
    return matched;
  }

  getUnknownFacts(): WorkingFact[] {
    const unknownList: WorkingFact[] = [];
    for (const fact of this.facts.values()) {
      if (fact.evidenceStatus === "unknown") {
        unknownList.push(fact);
      }
    }
    return unknownList;
  }

  getUnverifiedFacts(): WorkingFact[] {
    const unverifiedList: WorkingFact[] = [];
    for (const fact of this.facts.values()) {
      if (fact.evidenceStatus === "unverified" || fact.evidenceStatus === "user_reported") {
        unverifiedList.push(fact);
      }
    }
    return unverifiedList;
  }
}
