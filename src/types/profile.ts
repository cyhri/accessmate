/**
 * Accessibility Profile Types
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { BaseEntity } from "./common";

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
  readonly requiresStepFreeAccess: boolean;
  readonly maxStepHeightCm?: number;
  readonly maxRampSlopePercent?: number;
  readonly minDoorwayWidthCm?: number;
  readonly maxWalkingDistanceMeters?: number;
  readonly requiresElevatorForLevels: boolean;
  readonly requiresRestStopsEveryMeters?: number;
}

export interface VisionRequirements {
  readonly hasLowVision: boolean;
  readonly hasTotalBlindness: boolean;
  readonly requiresHighContrastSignage: boolean;
  readonly requiresTactileGroundPaving: boolean;
  readonly requiresBrailleSignage: boolean;
  readonly requiresAudioAnnouncements: boolean;
}

export interface HearingRequirements {
  readonly hasHearingLoss: boolean;
  readonly requiresVisualAlarms: boolean;
  readonly requiresHearingLoop: boolean;
  readonly requiresCaptionedAnnouncements: boolean;
}

export interface SensoryCognitiveRequirements {
  readonly sensitiveToLoudNoise: boolean;
  readonly sensitiveToCrowds: boolean;
  readonly sensitiveToFlickeringLights: boolean;
  readonly requiresQuietSpaces: boolean;
  readonly requiresSimplifiedWayfinding: boolean;
}

export interface UserAccessibilityProfile extends BaseEntity {
  readonly name: string;
  readonly isDefault: boolean;
  readonly mobility: MobilityRequirements;
  readonly vision: VisionRequirements;
  readonly hearing: HearingRequirements;
  readonly sensory: SensoryCognitiveRequirements;
  readonly notes?: string;
}
