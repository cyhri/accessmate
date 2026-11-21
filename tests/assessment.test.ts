import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  createEmptyAssessment,
  assessmentRepository,
  createUnknownEvidence,
} from "../src/lib/storage/assessment-storage.ts";
import { SAMPLE_BUILDING_ASSESSMENTS } from "../src/lib/storage/sample-data.ts";
import type { BuildingAssessmentRecord } from "../src/types/assessment.ts";
import { EVIDENCE_STATUSES } from "../src/constants/index.ts";

class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("ACCESSMATE — Building Assessment Domain & Persistence Tests", () => {
  let originalWindow: unknown;
  let originalLocalStorage: unknown;
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    const globalRecord = globalThis as Record<string, unknown>;
    originalWindow = globalRecord["window"];
    originalLocalStorage = globalRecord["localStorage"];

    globalRecord["localStorage"] = mockStorage;
    globalRecord["window"] = {
      dispatchEvent: () => true,
    };
  });

  afterEach(() => {
    const globalRecord = globalThis as Record<string, unknown>;
    globalRecord["window"] = originalWindow;
    globalRecord["localStorage"] = originalLocalStorage;
  });

  test("createEmptyAssessment initializes all physical features with 'unknown' evidence status", () => {
    const empty = createEmptyAssessment();

    assert.ok(empty.id.startsWith("assessment-"));
    assert.equal(empty.general.name, "");
    assert.equal(empty.general.buildingType, "public_facility");

    // Scientific Rigor check: unmeasured features MUST be 'unknown', never assumed true/false
    assert.equal(empty.entrance.stepFreeAccess.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.entrance.rampAvailability.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.entrance.automaticDoors.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.internalMovement.elevatorAvailable.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.restroom.accessibleRestroomAvailable.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.vision.tactilePaving.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.hearing.hearingLoop.status, EVIDENCE_STATUSES.UNKNOWN);
    assert.equal(empty.comfort.quietSpaces.status, EVIDENCE_STATUSES.UNKNOWN);
  });

  test("explicitly distinguishes between 'unknown' and 'verified absent' values", () => {
    // Unknown feature (missing data / not yet surveyed)
    const unmeasuredFeature = createUnknownEvidence<boolean>(false);
    assert.equal(unmeasuredFeature.value, false);
    assert.equal(unmeasuredFeature.status, "unknown");

    // Definitively verified absence (e.g. inspector confirmed no elevator exists)
    const verifiedAbsentFeature = {
      value: false,
      status: "verified" as const,
      notes: "Audited 2-story facility; no elevator installed.",
      source: "Municipal Inspector 2026",
    };
    assert.equal(verifiedAbsentFeature.value, false);
    assert.equal(verifiedAbsentFeature.status, "verified");

    // Not applicable feature (e.g. ramp handrails when ramp does not exist)
    const notApplicableFeature = {
      value: null,
      status: "not_applicable" as const,
    };
    assert.equal(notApplicableFeature.status, "not_applicable");
  });

  test("assessmentRepository seeds with sample data on initial first-time launch", () => {
    // Empty storage initially
    const initialList = assessmentRepository.getAssessments();

    assert.ok(Array.isArray(initialList));
    assert.equal(initialList.length, SAMPLE_BUILDING_ASSESSMENTS.length);
    assert.equal(initialList[0]?.id, "sample-metro-central");
    assert.equal(initialList[1]?.id, "sample-heritage-library");
  });

  test("assessmentRepository creates, updates, and retrieves a new building assessment", () => {
    const newAssessment: BuildingAssessmentRecord = {
      ...createEmptyAssessment(),
      id: "test-civic-centre",
      general: {
        name: "North District Civic Centre",
        buildingType: "government",
        address: "50 Civic Plaza, North District",
        floorsCount: 4,
        assessmentDate: "2026-11-20",
        notes: "Municipal administrative building with accessible service counters.",
      },
      entrance: {
        ...createEmptyAssessment().entrance,
        stepFreeAccess: { value: true, status: "verified", source: "City Audit 2026" },
        automaticDoors: { value: true, status: "verified" },
        doorClearWidthCm: { value: 92, status: "verified" },
      },
    };

    // Save
    const saved = assessmentRepository.saveAssessment(newAssessment);
    assert.equal(saved, true);

    // Retrieve by ID
    const retrieved = assessmentRepository.getAssessmentById("test-civic-centre");
    assert.ok(retrieved !== null);
    assert.equal(retrieved?.general.name, "North District Civic Centre");
    assert.equal(retrieved?.general.buildingType, "government");
    assert.equal(retrieved?.entrance.stepFreeAccess.value, true);
    assert.equal(retrieved?.entrance.stepFreeAccess.status, "verified");
    assert.equal(retrieved?.entrance.doorClearWidthCm.value, 92);

    // Update
    const updatedRecord: BuildingAssessmentRecord = {
      ...newAssessment,
      general: {
        ...newAssessment.general,
        name: "North District Civic Centre (Audited)",
      },
    };
    assessmentRepository.saveAssessment(updatedRecord);
    const updatedRetrieved = assessmentRepository.getAssessmentById("test-civic-centre");
    assert.equal(updatedRetrieved?.general.name, "North District Civic Centre (Audited)");
  });

  test("assessmentRepository deletes a building assessment record by ID", () => {
    // Ensure seed data loaded
    const initialList = assessmentRepository.getAssessments();
    const targetId = initialList[0]?.id;
    assert.ok(targetId);

    const deleted = assessmentRepository.deleteAssessment(targetId);
    assert.equal(deleted, true);

    const afterDeleteList = assessmentRepository.getAssessments();
    assert.equal(afterDeleteList.length, initialList.length - 1);
    assert.equal(assessmentRepository.getAssessmentById(targetId), null);
  });

  test("assessmentRepository resets to sample data cleanly", () => {
    // Delete all assessments
    mockStorage.setItem("accessmate_building_assessments", JSON.stringify([]));
    assert.equal(assessmentRepository.getAssessments().length, 0);

    // Reset to sample data
    const resetSuccess = assessmentRepository.resetToSampleData();
    assert.equal(resetSuccess, true);

    const restoredList = assessmentRepository.getAssessments();
    assert.equal(restoredList.length, SAMPLE_BUILDING_ASSESSMENTS.length);
  });

  test("assessmentRepository safely handles invalid and corrupted stored data with backup preservation", () => {
    // 1. Corrupt JSON: must preserve in backup and flag health report
    const corruptPayload = "{corrupt_json_payload";
    mockStorage.setItem("accessmate_building_assessments", corruptPayload);
    const resultFromCorrupt = assessmentRepository.getAssessments();
    assert.deepEqual(resultFromCorrupt, []);

    // Verify recovery backup preservation
    const backup = mockStorage.getItem("accessmate_building_assessments_corrupt_backup");
    assert.equal(backup, corruptPayload);
    const health = assessmentRepository.getStorageHealth();
    assert.equal(health.hasCorruptedData, true);

    // 2. Non-array JSON: must preserve in backup
    const nonArrayPayload = JSON.stringify({ not: "an_array" });
    mockStorage.setItem("accessmate_building_assessments", nonArrayPayload);
    const resultFromNonArray = assessmentRepository.getAssessments();
    assert.deepEqual(resultFromNonArray, []);
    assert.equal(
      mockStorage.getItem("accessmate_building_assessments_corrupt_backup"),
      nonArrayPayload
    );

    // Clean up warning
    assessmentRepository.clearStorageWarning();
  });
});
