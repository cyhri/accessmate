import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { InferenceEngine } from "../src/features/expert-system/index.ts";
import { getDefaultProfile } from "../src/lib/storage/profile-storage.ts";
import { createEmptyAssessment } from "../src/lib/storage/assessment-storage.ts";
import type { UserAccessibilityProfile } from "../src/types/profile.ts";
import type { BuildingAssessmentRecord } from "../src/types/assessment.ts";

// Helper builders for tests
function buildProfile(overrides?: Partial<UserAccessibilityProfile>): UserAccessibilityProfile {
  const base = getDefaultProfile();
  return {
    ...base,
    ...overrides,
    mobility: { ...base.mobility, ...(overrides?.mobility ?? {}) },
    vision: { ...base.vision, ...(overrides?.vision ?? {}) },
    hearing: { ...base.hearing, ...(overrides?.hearing ?? {}) },
    sensory: { ...base.sensory, ...(overrides?.sensory ?? {}) },
    temporary: { ...base.temporary, ...(overrides?.temporary ?? {}) },
  };
}

function buildAssessment(overrides?: Partial<BuildingAssessmentRecord>): BuildingAssessmentRecord {
  const base = createEmptyAssessment();
  return {
    ...base,
    ...overrides,
    general: { ...base.general, ...(overrides?.general ?? {}) },
    entrance: { ...base.entrance, ...(overrides?.entrance ?? {}) },
    internalMovement: { ...base.internalMovement, ...(overrides?.internalMovement ?? {}) },
    restroom: { ...base.restroom, ...(overrides?.restroom ?? {}) },
    vision: { ...base.vision, ...(overrides?.vision ?? {}) },
    hearing: { ...base.hearing, ...(overrides?.hearing ?? {}) },
    comfort: { ...base.comfort, ...(overrides?.comfort ?? {}) },
  };
}

describe("ACCESSMATE — Expert Inference Engine Knowledge Base & Reasoning Tests", () => {
  // Scenario 1: MOB-001 Essential step-free entrance requirement with stairs confirmed
  test("MOB-001: Fires critical barrier when step-free access is essential and stairs exist with no ramp", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
        stepCount: { value: 5, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
        alternativeAccessibleEntrance: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "MOB-001");

    assert.ok(barrier, "MOB-001 must fire");
    assert.equal(barrier?.severity, "critical");
    assert.equal(barrier?.isResolvedByArrangement, false);
    assert.equal(result.overallOutcome, "unsuitable");
  });

  // Scenario 2: MOB-002 Alternative entrance resolves step-free requirement
  test("MOB-002: Verified alternative entrance resolves main entrance stairs barrier", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
        stepCount: { value: 4, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
        alternativeAccessibleEntrance: { value: true, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const mob002Strength = result.strengths.find((s) => s.ruleId === "MOB-002");
    assert.ok(mob002Strength, "MOB-002 must record strength");

    const mob001Barrier = result.barriers.find((b) => b.ruleId === "MOB-001");
    if (mob001Barrier) {
      assert.equal(mob001Barrier.isResolvedByArrangement, true);
    }
    assert.equal(result.overallOutcome, "suitable_with_arrangements");
  });

  // Scenario 3: MOB-003 Doorway clear width clearance restriction
  test("MOB-003: Fires barrier when doorway width is narrower than required threshold", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        minDoorwayWidthCm: 85,
        usesWheelchair: true,
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        doorClearWidthCm: { value: 75, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "MOB-003");
    assert.ok(barrier, "MOB-003 must detect doorway restriction");
    assert.equal(barrier?.severity, "critical");
  });

  // Scenario 4: MOB-004 Ramp gradient slope exceeds user physical tolerance
  test("MOB-004: Fires barrier when ramp slope exceeds user maximum slope tolerance", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        maxRampSlopePercent: 8,
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        rampSlopePercent: { value: 12, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "MOB-004");
    assert.ok(barrier, "MOB-004 must fire for steep ramp");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 5: MOB-005 Stair & ramp handrail deficiency
  test("MOB-005: Detects handrail deficiency when essential handrail user visits facility lacking handrails", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresHandrails: "essential",
      },
    });

    const place = buildAssessment({
      internalMovement: {
        ...createEmptyAssessment().internalMovement,
        staircaseHandrails: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "MOB-005");
    assert.ok(barrier, "MOB-005 must detect missing handrails");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 6: MOB-006 Preferred step-free access creates medium barrier
  test("MOB-006: Preferred step-free requirement unmet creates medium barrier without deeming venue unsuitable", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "preferred",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "MOB-006");
    assert.ok(barrier, "MOB-006 must fire for preferred requirement");
    assert.equal(barrier?.severity, "medium");
    assert.equal(result.overallOutcome, "difficult");
  });

  // Scenario 7: ELEV-001 Elevator unavailable in multi-floor building
  test("ELEV-001: Fires critical barrier when elevator is out of service in multi-floor facility", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresElevatorForLevels: "essential",
      },
    });

    const place = buildAssessment({
      general: {
        ...createEmptyAssessment().general,
        floorsCount: 3,
      },
      internalMovement: {
        ...createEmptyAssessment().internalMovement,
        elevatorAvailable: { value: true, status: "verified" },
        elevatorOperationalStatus: { value: "out_of_service", status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "ELEV-001");
    assert.ok(barrier, "ELEV-001 must fire when elevator is broken");
    assert.equal(barrier?.severity, "critical");
    assert.equal(result.overallOutcome, "unsuitable");
  });

  // Scenario 8: ELEV-002 Elevator operational status unknown flags information gap
  test("ELEV-002: Flags information gap when elevator operational reliability is unknown in multi-floor venue", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresElevatorForLevels: "essential",
      },
    });

    const place = buildAssessment({
      general: {
        ...createEmptyAssessment().general,
        floorsCount: 4,
      },
      internalMovement: {
        ...createEmptyAssessment().internalMovement,
        elevatorAvailable: { value: true, status: "verified" },
        elevatorOperationalStatus: { value: "unknown", status: "unknown" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const gap = result.informationGaps.find((g) => g.ruleId === "ELEV-002");
    assert.ok(gap, "ELEV-002 must flag info gap");
    assert.equal(result.overallOutcome, "insufficient_information");
  });

  // Scenario 9: ELEV-003 Accessible restroom located on unreachable floor
  test("ELEV-003: Flags barrier when accessible restroom is on upper floor with broken elevator", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresAccessibleRestroom: "essential",
        requiresElevatorForLevels: "essential",
      },
    });

    const place = buildAssessment({
      general: {
        ...createEmptyAssessment().general,
        floorsCount: 2,
      },
      internalMovement: {
        ...createEmptyAssessment().internalMovement,
        elevatorAvailable: { value: false, status: "verified" },
      },
      restroom: {
        ...createEmptyAssessment().restroom,
        accessibleRestroomAvailable: { value: true, status: "verified" },
        restroomFloors: { value: "Floor 2 Only", status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "ELEV-003");
    assert.ok(barrier, "ELEV-003 must detect unreachable restroom");
    assert.equal(barrier?.severity, "critical");
  });

  // Scenario 10: ELEV-004 Operational elevator strength
  test("ELEV-004: Identifies verified operational elevator as accessibility strength", () => {
    const profile = getDefaultProfile();
    const place = buildAssessment({
      internalMovement: {
        ...createEmptyAssessment().internalMovement,
        elevatorAvailable: { value: true, status: "verified" },
        elevatorOperationalStatus: { value: "operational", status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const strength = result.strengths.find((s) => s.ruleId === "ELEV-004");
    assert.ok(strength, "ELEV-004 must record strength");
  });

  // Scenario 11: VIS-001 Missing tactile paving
  test("VIS-001: Fires high barrier when essential tactile ground paving is absent", () => {
    const profile = buildProfile({
      vision: {
        ...getDefaultProfile().vision,
        requiresTactileGroundPaving: "essential",
      },
    });

    const place = buildAssessment({
      vision: {
        ...createEmptyAssessment().vision,
        tactilePaving: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "VIS-001");
    assert.ok(barrier, "VIS-001 must fire when tactile paving absent");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 12: VIS-002 High-contrast signage deficiency
  test("VIS-002: Detects visual signage contrast deficiency for low-vision user", () => {
    const profile = buildProfile({
      vision: {
        ...getDefaultProfile().vision,
        requiresHighContrastSignage: "essential",
      },
    });

    const place = buildAssessment({
      vision: {
        ...createEmptyAssessment().vision,
        highContrastSignage: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "VIS-002");
    assert.ok(barrier, "VIS-002 must fire");
    assert.equal(barrier?.severity, "medium");
  });

  // Scenario 13: VIS-003 Unknown tactile paving status
  test("VIS-003: Creates information gap when tactile paving status has unknown evidence status", () => {
    const profile = buildProfile({
      vision: {
        ...getDefaultProfile().vision,
        requiresTactileGroundPaving: "essential",
      },
    });

    const place = buildAssessment({
      vision: {
        ...createEmptyAssessment().vision,
        tactilePaving: { value: false, status: "unknown" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const gap = result.informationGaps.find((g) => g.ruleId === "VIS-003");
    assert.ok(gap, "VIS-003 must detect info gap");
    assert.equal(result.overallOutcome, "insufficient_information");
  });

  // Scenario 14: VIS-004 Tactile & audio wayfinding strength
  test("VIS-004: Records accessibility strength when tactile paving and audio announcements exist", () => {
    const profile = getDefaultProfile();
    const place = buildAssessment({
      vision: {
        ...createEmptyAssessment().vision,
        tactilePaving: { value: true, status: "verified" },
        audioAnnouncements: { value: true, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const strength = result.strengths.find((s) => s.ruleId === "VIS-004");
    assert.ok(strength, "VIS-004 must record strength");
  });

  // Scenario 15: HEAR-001 Audio-only announcements barrier
  test("HEAR-001: Detects barrier when auditory-only announcements lack visual screens", () => {
    const profile = buildProfile({
      hearing: {
        ...getDefaultProfile().hearing,
        requiresVisualAnnouncements: "essential",
      },
    });

    const place = buildAssessment({
      hearing: {
        ...createEmptyAssessment().hearing,
        visualAnnouncements: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "HEAR-001");
    assert.ok(barrier, "HEAR-001 must fire");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 16: HEAR-002 Visual emergency alarms strength
  test("HEAR-002: Identifies verified visual strobe emergency alarms as strength", () => {
    const profile = getDefaultProfile();
    const place = buildAssessment({
      hearing: {
        ...createEmptyAssessment().hearing,
        visualEmergencyAlerts: { value: true, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const strength = result.strengths.find((s) => s.ruleId === "HEAR-002");
    assert.ok(strength, "HEAR-002 must record strength");
  });

  // Scenario 17: HEAR-003 Hearing induction loop strength
  test("HEAR-003: Identifies verified hearing loop system as strength", () => {
    const profile = getDefaultProfile();
    const place = buildAssessment({
      hearing: {
        ...createEmptyAssessment().hearing,
        hearingLoop: { value: true, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const strength = result.strengths.find((s) => s.ruleId === "HEAR-003");
    assert.ok(strength, "HEAR-003 must record strength");
  });

  // Scenario 18: STAM-001 Walking distance exceeds limit
  test("STAM-001: Fires barrier when parking walking distance exceeds user endurance limit", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        maxWalkingDistanceMeters: 50,
      },
    });

    const place = buildAssessment({
      comfort: {
        ...createEmptyAssessment().comfort,
        accessibleParkingDistanceMeters: { value: 120, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "STAM-001");
    assert.ok(barrier, "STAM-001 must detect excessive walking distance");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 19: STAM-002 Rest seating deficient
  test("STAM-002: Fires barrier when user requiring frequent rest encounters venue lacking benches", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresFrequentRestStops: "essential",
      },
    });

    const place = buildAssessment({
      comfort: {
        ...createEmptyAssessment().comfort,
        seatingRestPoints: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "STAM-002");
    assert.ok(barrier, "STAM-002 must detect absent seating");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 20: STAM-003 Acute temporary injury restricted by stairs
  test("STAM-003: Detects conflict when acute injury prevents climbing stairs at entrance", () => {
    const profile = buildProfile({
      temporary: {
        ...getDefaultProfile().temporary,
        hasTemporaryLimitation: true,
        difficultyUsingStairs: true,
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "STAM-003");
    assert.ok(barrier, "STAM-003 must fire for acute temporary limitation");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 21: SENS-001 Low-noise sensory environment unmet
  test("SENS-001: Fires barrier when quiet decompression spaces are absent for sensory user", () => {
    const profile = buildProfile({
      sensory: {
        ...getDefaultProfile().sensory,
        prefersQuieterEnvironments: "essential",
      },
    });

    const place = buildAssessment({
      comfort: {
        ...createEmptyAssessment().comfort,
        quietSpaces: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "SENS-001");
    assert.ok(barrier, "SENS-001 must fire when quiet spaces absent");
    assert.equal(barrier?.severity, "high");
  });

  // Scenario 22: SENS-002 Predictable wayfinding & lighting deficiency
  test("SENS-002: Detects navigation disorientation when lighting is flickering or pathways unmarked", () => {
    const profile = buildProfile({
      sensory: {
        ...getDefaultProfile().sensory,
        requiresPredictableWayfinding: "essential",
      },
    });

    const place = buildAssessment({
      vision: {
        ...createEmptyAssessment().vision,
        lightingQuality: { value: "flickering", status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const barrier = result.barriers.find((b) => b.ruleId === "SENS-002");
    assert.ok(barrier, "SENS-002 must detect disorientation risk");
  });

  // Scenario 23: UNC-001 Critical feature unknown triggers information gap
  test("UNC-001: Flags unmeasured essential step-free feature as information gap", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "unknown" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const gap = result.informationGaps.find((g) => g.ruleId === "UNC-001");
    assert.ok(gap, "UNC-001 must flag unknown step-free status");
    assert.equal(result.overallOutcome, "insufficient_information");
  });

  // Scenario 24: UNC-002 Contradictory observation conflict
  test("UNC-002: Detects direct contradiction when step-free is marked true but physical steps > 0 with no ramp", () => {
    const profile = getDefaultProfile();
    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: true, status: "user_reported" },
        stepCount: { value: 6, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const conflict = result.evidenceConflicts.find((c) => c.ruleId === "UNC-002");
    assert.ok(conflict, "UNC-002 must detect contradictory evidence");
    assert.equal(result.overallOutcome, "insufficient_information");
  });

  // Scenario 25: UNC-003 Unverified data creates information gap
  test("UNC-003: Creates information gap when key claims rely on unverified data", () => {
    const profile = getDefaultProfile();
    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        alternativeAccessibleEntrance: { value: true, status: "unverified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const gap = result.informationGaps.find((g) => g.ruleId === "UNC-003");
    assert.ok(gap, "UNC-003 must detect unverified data");
  });

  // Scenario 26: 5-Tier outcome - "suitable" when all requirements verified met with zero barriers
  test("Outcome Synthesis: Yields 'suitable' when all requirements are met with zero barriers and zero gaps", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: true, status: "verified" },
        stepCount: { value: 0, status: "verified" },
        doorClearWidthCm: { value: 90, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    assert.equal(result.barriers.length, 0);
    assert.equal(result.informationGaps.length, 0);
    assert.equal(result.overallOutcome, "suitable");
    assert.ok(result.outcomeTitle.toLowerCase().includes("suitable"));
  });

  // Scenario 27: 5-Tier outcome - "unsuitable" takes absolute precedence over other findings
  test("Outcome Synthesis: Critical barrier overrides information gaps to yield 'unsuitable'", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
        requiresElevatorForLevels: "essential",
      },
    });

    const place = buildAssessment({
      general: {
        ...createEmptyAssessment().general,
        floorsCount: 3,
      },
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
        alternativeAccessibleEntrance: { value: false, status: "verified" },
      },
      internalMovement: {
        ...createEmptyAssessment().internalMovement,
        elevatorAvailable: { value: true, status: "unknown" }, // gap
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    assert.equal(result.overallOutcome, "unsuitable");
  });

  // Scenario 28: 5-Tier outcome - "difficult" when non-critical barriers exist without critical blockers
  test("Outcome Synthesis: Yields 'difficult' when only medium barriers are present", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "preferred", // preferred, not essential
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    assert.equal(result.overallOutcome, "difficult");
    assert.ok(result.outcomeTitle.toLowerCase().includes("difficult"));
  });

  // Scenario 29: Explanation trace auditability
  test("Explanation Facility: Generates comprehensive explanation trace for every fired rule", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
        stepCount: { value: 3, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
        alternativeAccessibleEntrance: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    assert.ok(result.explanationTraces.length > 0);

    const trace = result.explanationTraces[0];
    assert.ok(trace, "Explanation trace must be present");
    assert.ok(trace.ruleId);
    assert.ok(trace.ruleName);
    assert.ok(trace.category);
    assert.ok(trace.conclusion);
    assert.ok(trace.firedSequence >= 1);
  });

  // Scenario 30: Recommendation Engine synthesis
  test("Recommendation Engine: Prioritizes and deduplicates recommendations based on findings", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
        maxWalkingDistanceMeters: 40,
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
        stepCount: { value: 3, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
        alternativeAccessibleEntrance: { value: false, status: "verified" },
      },
      comfort: {
        ...createEmptyAssessment().comfort,
        accessibleParkingDistanceMeters: { value: 100, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    assert.ok(result.recommendations.length >= 2);
    assert.ok(result.recommendations.some((r) => r.priority === "critical"));
  });

  // Scenario 31: Deterministic evaluation runs
  test("Determinism: Produces identical evaluation results on consecutive runs with identical inputs", () => {
    const profile = getDefaultProfile();
    const place = createEmptyAssessment();

    const run1 = InferenceEngine.evaluate(profile, place);
    const run2 = InferenceEngine.evaluate(profile, place);

    assert.equal(run1.overallOutcome, run2.overallOutcome);
    assert.equal(run1.barriers.length, run2.barriers.length);
    assert.equal(run1.strengths.length, run2.strengths.length);
    assert.equal(run1.informationGaps.length, run2.informationGaps.length);
    assert.equal(run1.rulesFiredCount, run2.rulesFiredCount);
  });

  // Scenario 32: Duplicate rule prevention
  test("Rule Engine: Each rule fires at most once during forward-chaining evaluation", () => {
    const profile = buildProfile({
      mobility: {
        ...getDefaultProfile().mobility,
        requiresStepFreeAccess: "essential",
      },
    });

    const place = buildAssessment({
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: false, status: "verified" },
        stepCount: { value: 5, status: "verified" },
        rampAvailability: { value: false, status: "verified" },
        alternativeAccessibleEntrance: { value: false, status: "verified" },
      },
    });

    const result = InferenceEngine.evaluate(profile, place);
    const ruleIds = result.explanationTraces.map((t) => t.ruleId);
    const uniqueIds = new Set(ruleIds);
    assert.equal(ruleIds.length, uniqueIds.size, "No rule should fire more than once");
  });

  // Scenario 33: Forward chaining terminates cleanly without infinite loops
  test("Forward Chaining Loop Safety: Terminates safely within MAX_ITERATIONS", () => {
    const profile = getDefaultProfile();
    const place = createEmptyAssessment();

    const startTime = Date.now();
    const result = InferenceEngine.evaluate(profile, place);
    const duration = Date.now() - startTime;

    assert.ok(duration < 500, "Inference must complete quickly (<500ms)");
    assert.ok(result.evaluationId);
  });

  // Scenario 34: Working memory fact extraction coverage
  test("Fact Extractor: Normalizes all profile dimensions and environmental features into working facts", () => {
    const profile = getDefaultProfile();
    const place = createEmptyAssessment();

    const result = InferenceEngine.evaluate(profile, place);
    assert.ok(result.rulesEvaluatedCount >= 24, "All knowledge rules must be evaluated");
  });

  // Scenario 35: Handling empty/default assessments gracefully
  test("Default Assessment: Evaluates empty default assessment without throwing exceptions", () => {
    const profile = getDefaultProfile();
    const place = createEmptyAssessment();

    assert.doesNotThrow(() => {
      const result = InferenceEngine.evaluate(profile, place);
      assert.ok(result);
    });
  });
});
