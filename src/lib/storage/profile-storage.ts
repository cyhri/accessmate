/**
 * Profile Local Storage Repository
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { UserAccessibilityProfile } from "../../types/profile.ts";

const PROFILE_STORAGE_KEY = "accessmate_user_profile";

/**
 * Returns a clean, functional default profile without medical diagnoses.
 */
export function getDefaultProfile(): UserAccessibilityProfile {
  const now = new Date().toISOString();
  return {
    id: "default-profile",
    name: "My Accessibility Profile",
    preferredCategory: "Standard / Multi-Need",
    notes: "Default functional requirements for transit and building accessibility.",
    isDefault: true,
    createdAt: now,
    updatedAt: now,
    mobility: {
      primaryAid: "none",
      usesWheelchair: false,
      usesMobilityScooter: false,
      usesCrutchesOrWalkingAid: false,
      difficultyClimbingStairs: false,
      requiresStepFreeAccess: "not_required",
      requiresHandrails: "not_required",
      requiresAccessibleRestroom: "not_required",
      requiresElevatorForLevels: "not_required",
      requiresFrequentRestStops: "not_required",
      maxStepHeightCm: null,
      maxRampSlopePercent: null,
      minDoorwayWidthCm: null,
      maxWalkingDistanceMeters: null,
      restStopIntervalMeters: null,
    },
    vision: {
      hasBlindness: false,
      hasLowVision: false,
      requiresTactileGroundPaving: "not_required",
      requiresAudioGuidance: "not_required",
      requiresHighContrastSignage: "not_required",
      requiresIdentifiableEntrances: "not_required",
      requiresObstacleFreePaths: "not_required",
      requiresBrailleSignage: "not_required",
    },
    hearing: {
      isDeafOrHardOfHearing: false,
      requiresVisualAnnouncements: "not_required",
      requiresWrittenInstructions: "not_required",
      requiresVisualEmergencyAlerts: "not_required",
      requiresClearVisualSignage: "not_required",
      requiresHearingLoop: "not_required",
    },
    sensory: {
      prefersQuieterEnvironments: "not_required",
      requiresPredictableWayfinding: "not_required",
      prefersSimpleSignage: "not_required",
      requiresReducedSensoryStimulation: "not_required",
      prefersClearlyMarkedRoutes: "not_required",
    },
    temporary: {
      hasTemporaryLimitation: false,
      temporaryInjury: false,
      limitedWalkingEndurance: false,
      difficultyUsingStairs: false,
      temporaryUseOfCrutches: false,
      description: "",
      expectedDurationDays: null,
    },
  };
}

export const profileRepository = {
  /**
   * Retrieves the stored user profile, or returns null if none has been saved.
   */
  getProfile(): UserAccessibilityProfile | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.mobility) {
        return null;
      }
      return parsed as UserAccessibilityProfile;
    } catch {
      return null;
    }
  },

  /**
   * Saves a profile to local storage.
   */
  saveProfile(profile: UserAccessibilityProfile): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const record: UserAccessibilityProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(record));
      window.dispatchEvent(new Event("accessmate:profile-updated"));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Resets/removes the stored profile.
   */
  clearProfile(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.dispatchEvent(new Event("accessmate:profile-updated"));
      return true;
    } catch {
      return false;
    }
  },
};
