/**
 * Accessibility Profile Types
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { BaseEntity } from "./common";
import type { RequirementLevel } from "../constants";

export type MobilityAid =
  | "manual_wheelchair"
  | "power_wheelchair"
  | "mobility_scooter"
  | "crutches"
  | "walker"
  | "walking_cane"
  | "guide_dog"
  | "none";

export interface MobilityRequirements {
  readonly primaryAid: MobilityAid;
  readonly usesWheelchair: boolean;
  readonly usesMobilityScooter: boolean;
  readonly usesCrutchesOrWalkingAid: boolean;
  readonly difficultyClimbingStairs: boolean;
  
  // Requirement levels for environmental features
  readonly requiresStepFreeAccess: RequirementLevel;
  readonly requiresHandrails: RequirementLevel;
  readonly requiresAccessibleRestroom: RequirementLevel;
  readonly requiresElevatorForLevels: RequirementLevel;
  readonly requiresFrequentRestStops: RequirementLevel;

  // Specific measurements and thresholds (optional nullables)
  readonly maxStepHeightCm: number | null;
  readonly maxRampSlopePercent: number | null;
  readonly minDoorwayWidthCm: number | null;
  readonly maxWalkingDistanceMeters: number | null;
  readonly restStopIntervalMeters: number | null;
}

export interface VisionRequirements {
  readonly hasBlindness: boolean;
  readonly hasLowVision: boolean;

  readonly requiresTactileGroundPaving: RequirementLevel;
  readonly requiresAudioGuidance: RequirementLevel;
  readonly requiresHighContrastSignage: RequirementLevel;
  readonly requiresIdentifiableEntrances: RequirementLevel;
  readonly requiresObstacleFreePaths: RequirementLevel;
  readonly requiresBrailleSignage: RequirementLevel;
}

export interface HearingRequirements {
  readonly isDeafOrHardOfHearing: boolean;

  readonly requiresVisualAnnouncements: RequirementLevel;
  readonly requiresWrittenInstructions: RequirementLevel;
  readonly requiresVisualEmergencyAlerts: RequirementLevel;
  readonly requiresClearVisualSignage: RequirementLevel;
  readonly requiresHearingLoop: RequirementLevel;
}

export interface SensoryRequirements {
  readonly prefersQuieterEnvironments: RequirementLevel;
  readonly requiresPredictableWayfinding: RequirementLevel;
  readonly prefersSimpleSignage: RequirementLevel;
  readonly requiresReducedSensoryStimulation: RequirementLevel;
  readonly prefersClearlyMarkedRoutes: RequirementLevel;
}

export interface TemporaryRequirements {
  readonly hasTemporaryLimitation: boolean;
  readonly temporaryInjury: boolean;
  readonly limitedWalkingEndurance: boolean;
  readonly difficultyUsingStairs: boolean;
  readonly temporaryUseOfCrutches: boolean;
  readonly description: string;
  readonly expectedDurationDays: number | null;
}

export interface UserAccessibilityProfile extends BaseEntity {
  readonly name: string;
  readonly preferredCategory: string;
  readonly notes?: string;
  readonly isDefault: boolean;
  readonly mobility: MobilityRequirements;
  readonly vision: VisionRequirements;
  readonly hearing: HearingRequirements;
  readonly sensory: SensoryRequirements;
  readonly temporary: TemporaryRequirements;
}
