/**
 * Place & Built-Environment Assessment Types
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { BaseEntity, GeoCoordinates, Address } from "./common";
import type { EvidenceLevel } from "../constants";

export type FacilityCategory =
  | "hospital_clinic"
  | "educational_institution"
  | "government_office"
  | "transit_station"
  | "commercial_retail"
  | "cultural_recreational"
  | "public_park"
  | "other";

export interface EntranceAssessment {
  readonly hasStepFreeAccess: boolean;
  readonly stepCount: number;
  readonly stepHeightCm?: number;
  readonly hasRamp: boolean;
  readonly rampSlopePercent?: number;
  readonly rampHasHandrails?: boolean;
  readonly doorWidthCm: number;
  readonly isAutomatedDoor: boolean;
  readonly doorType: "automatic_sliding" | "push_button" | "manual_pull" | "revolving";
}

export interface InternalVerticalCirculation {
  readonly hasMultipleLevels: boolean;
  readonly hasElevator: boolean;
  readonly elevatorDoorWidthCm?: number;
  readonly elevatorCabinDepthCm?: number;
  readonly elevatorHasAudioFeedback?: boolean;
  readonly elevatorHasBrailleButtons?: boolean;
  readonly elevatorOperationalStatus?: "operational" | "out_of_service" | "unknown";
  readonly stairCount?: number;
}

export interface RestroomAssessment {
  readonly hasAccessibleRestroom: boolean;
  readonly doorWidthCm?: number;
  readonly hasGrabBars?: boolean;
  readonly hasEmergencyPullCord?: boolean;
  readonly turningRadiusCm?: number;
}

export interface SensoryEnvironmentAssessment {
  readonly typicalNoiseLevel: "quiet" | "moderate" | "loud" | "very_loud";
  readonly lightingQuality: "diffuse_natural" | "bright_artificial" | "dim" | "flickering";
  readonly hasTactileGuidance: boolean;
  readonly hasHighContrastSignage: boolean;
  readonly hasHearingLoopSystem: boolean;
}

export interface PlaceAccessibilityRecord extends BaseEntity {
  readonly name: string;
  readonly category: FacilityCategory;
  readonly coordinates: GeoCoordinates;
  readonly address: Address;
  readonly entrance: EntranceAssessment;
  readonly circulation: InternalVerticalCirculation;
  readonly restroom: RestroomAssessment;
  readonly sensory: SensoryEnvironmentAssessment;
  readonly evidenceLevel: EvidenceLevel;
  readonly lastAuditDate?: string;
  readonly auditorNotes?: string;
}
