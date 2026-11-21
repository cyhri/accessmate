import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  getDefaultProfile,
  profileRepository,
} from "../src/lib/storage/profile-storage.ts";
import { PROFILE_PRESETS } from "../src/features/profiles/profile-presets.ts";
import type { UserAccessibilityProfile } from "../src/types/profile.ts";
import { REQUIREMENT_LEVELS } from "../src/constants/index.ts";

// Simple in-memory localStorage mock for Node test runner
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

describe("ACCESSMATE — Accessibility Profile Domain & Persistence Tests", () => {
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

  test("getDefaultProfile returns a complete, well-typed functional profile", () => {
    const profile = getDefaultProfile();

    assert.equal(profile.id, "default-profile");
    assert.equal(profile.isDefault, true);
    assert.equal(typeof profile.name, "string");
    assert.ok(profile.name.length > 0);

    // Mobility
    assert.equal(profile.mobility.primaryAid, "none");
    assert.equal(profile.mobility.requiresStepFreeAccess, REQUIREMENT_LEVELS.NOT_REQUIRED);
    assert.equal(profile.mobility.requiresHandrails, REQUIREMENT_LEVELS.NOT_REQUIRED);
    assert.equal(profile.mobility.maxStepHeightCm, null);
    assert.equal(profile.mobility.maxRampSlopePercent, null);

    // Vision
    assert.equal(profile.vision.hasBlindness, false);
    assert.equal(profile.vision.requiresTactileGroundPaving, REQUIREMENT_LEVELS.NOT_REQUIRED);

    // Hearing
    assert.equal(profile.hearing.isDeafOrHardOfHearing, false);
    assert.equal(profile.hearing.requiresVisualEmergencyAlerts, REQUIREMENT_LEVELS.NOT_REQUIRED);

    // Sensory
    assert.equal(profile.sensory.prefersQuieterEnvironments, REQUIREMENT_LEVELS.NOT_REQUIRED);

    // Temporary
    assert.equal(profile.temporary.hasTemporaryLimitation, false);
  });

  test("profileRepository saves and retrieves a modified user profile", () => {
    const profile = getDefaultProfile();
    const updated: UserAccessibilityProfile = {
      ...profile,
      name: "Custom Power Wheelchair Profile",
      preferredCategory: "Wheeled Mobility",
      mobility: {
        ...profile.mobility,
        primaryAid: "power_wheelchair",
        usesWheelchair: true,
        requiresStepFreeAccess: "essential",
        maxStepHeightCm: 0,
        maxRampSlopePercent: 6,
        minDoorwayWidthCm: 85,
      },
      vision: {
        ...profile.vision,
        requiresObstacleFreePaths: "essential",
      },
    };

    const saved = profileRepository.saveProfile(updated);
    assert.equal(saved, true);

    const retrieved = profileRepository.getProfile();
    assert.ok(retrieved !== null);
    assert.equal(retrieved?.name, "Custom Power Wheelchair Profile");
    assert.equal(retrieved?.mobility.primaryAid, "power_wheelchair");
    assert.equal(retrieved?.mobility.usesWheelchair, true);
    assert.equal(retrieved?.mobility.requiresStepFreeAccess, "essential");
    assert.equal(retrieved?.mobility.minDoorwayWidthCm, 85);
    assert.equal(retrieved?.vision.requiresObstacleFreePaths, "essential");
  });

  test("profileRepository correctly handles clearing stored profile", () => {
    const profile = getDefaultProfile();
    profileRepository.saveProfile(profile);
    assert.ok(profileRepository.getProfile() !== null);

    const cleared = profileRepository.clearProfile();
    assert.equal(cleared, true);
    assert.equal(profileRepository.getProfile(), null);
  });

  test("profileRepository handles invalid and malformed stored data gracefully", () => {
    // 1. Corrupt JSON
    mockStorage.setItem("accessmate_user_profile", "{invalid_json:");
    assert.equal(profileRepository.getProfile(), null);

    // 2. Non-object primitive
    mockStorage.setItem("accessmate_user_profile", JSON.stringify("string_payload"));
    assert.equal(profileRepository.getProfile(), null);

    // 3. Object missing required mobility domain
    mockStorage.setItem("accessmate_user_profile", JSON.stringify({ name: "Incomplete" }));
    assert.equal(profileRepository.getProfile(), null);
  });

  test("all pre-configured persona presets adhere to the profile data structure", () => {
    assert.ok(PROFILE_PRESETS.length >= 4);

    for (const preset of PROFILE_PRESETS) {
      assert.ok(preset.id.startsWith("preset-"));
      assert.ok(preset.name.length > 0);
      assert.ok(preset.category.length > 0);
      assert.ok(preset.data.mobility);
      assert.ok(preset.data.vision);
      assert.ok(preset.data.hearing);
      assert.ok(preset.data.sensory);
      assert.ok(preset.data.temporary);

      // Verify requirement levels
      const validLevels = ["essential", "preferred", "not_required"];
      assert.ok(validLevels.includes(preset.data.mobility.requiresStepFreeAccess));
      assert.ok(validLevels.includes(preset.data.vision.requiresTactileGroundPaving));
      assert.ok(validLevels.includes(preset.data.hearing.requiresVisualAnnouncements));
      assert.ok(validLevels.includes(preset.data.sensory.prefersQuieterEnvironments));
    }
  });
});
