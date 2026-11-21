/**
 * Place & Built-Environment Assessment Types
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { BaseEntity } from "./common";
import type { EvidenceStatus, BuildingType } from "../constants";

/**
 * Standard evidence container. Every measured or observed physical feature
 * carries an explicit status: verified, user_reported, unverified, unknown, or not_applicable.
 */
export interface EvidenceItem<T> {
  readonly value: T;
  readonly status: EvidenceStatus;
  readonly notes?: string;
  readonly source?: string;
  readonly verifiedAt?: string;
}

export interface BuildingGeneralInfo {
  readonly name: string;
  readonly buildingType: BuildingType;
  readonly address: string;
  readonly floorsCount: number | null;
  readonly assessmentDate: string;
  readonly notes: string;
}

export interface BuildingEntranceFeature {
  readonly stepFreeAccess: EvidenceItem<boolean>;
  readonly rampAvailability: EvidenceItem<boolean>;
  readonly rampSlopePercent: EvidenceItem<number | null>;
  readonly rampHasHandrails: EvidenceItem<boolean>;
  readonly stepCount: EvidenceItem<number | null>;
  readonly stepHeightCm: EvidenceItem<number | null>;
  readonly automaticDoors: EvidenceItem<boolean>;
  readonly doorType: EvidenceItem<"automatic_sliding" | "push_button" | "manual_pull" | "revolving" | "unknown">;
  readonly doorClearWidthCm: EvidenceItem<number | null>;
  readonly alternativeAccessibleEntrance: EvidenceItem<boolean>;
  readonly entranceSignage: EvidenceItem<boolean>;
}

export interface BuildingInternalMovement {
  readonly elevatorAvailable: EvidenceItem<boolean>;
  readonly elevatorOperationalStatus: EvidenceItem<"operational" | "out_of_service" | "unknown">;
  readonly elevatorDoorWidthCm: EvidenceItem<number | null>;
  readonly elevatorCabinDepthCm: EvidenceItem<number | null>;
  readonly elevatorAudioFeedback: EvidenceItem<boolean>;
  readonly elevatorBrailleButtons: EvidenceItem<boolean>;
  readonly staircaseAvailable: EvidenceItem<boolean>;
  readonly staircaseHandrails: EvidenceItem<boolean>;
  readonly corridorClearWidthCm: EvidenceItem<number | null>;
  readonly doorwayClearanceCm: EvidenceItem<number | null>;
  readonly internalRamps: EvidenceItem<boolean>;
  readonly allFloorsAccessible: EvidenceItem<boolean>;
}

export interface BuildingRestroomFeature {
  readonly accessibleRestroomAvailable: EvidenceItem<boolean>;
  readonly restroomFloors: EvidenceItem<string>;
  readonly accessibleStallAvailable: EvidenceItem<boolean>;
  readonly grabBarsPresent: EvidenceItem<boolean>;
  readonly emergencyPullCord: EvidenceItem<boolean>;
  readonly doorClearWidthCm: EvidenceItem<number | null>;
  readonly turningRadiusCm: EvidenceItem<number | null>;
}

export interface BuildingVisionFeature {
  readonly tactilePaving: EvidenceItem<boolean>;
  readonly brailleSignage: EvidenceItem<boolean>;
  readonly highContrastSignage: EvidenceItem<boolean>;
  readonly audioAnnouncements: EvidenceItem<boolean>;
  readonly lightingQuality: EvidenceItem<"diffuse_natural" | "bright_artificial" | "dim" | "flickering" | "unknown">;
  readonly obstacleFreePaths: EvidenceItem<boolean>;
}

export interface BuildingHearingFeature {
  readonly visualAnnouncements: EvidenceItem<boolean>;
  readonly writtenInstructions: EvidenceItem<boolean>;
  readonly visualEmergencyAlerts: EvidenceItem<boolean>;
  readonly informationDisplays: EvidenceItem<boolean>;
  readonly hearingLoop: EvidenceItem<boolean>;
}

export interface BuildingComfortFeature {
  readonly seatingRestPoints: EvidenceItem<boolean>;
  readonly restPointIntervalMeters: EvidenceItem<number | null>;
  readonly quietSpaces: EvidenceItem<boolean>;
  readonly accessibleParking: EvidenceItem<boolean>;
  readonly accessibleParkingDistanceMeters: EvidenceItem<number | null>;
  readonly clearlyMarkedPathways: EvidenceItem<boolean>;
  readonly staffAssistanceAvailable: EvidenceItem<boolean>;
}

export interface BuildingAssessmentRecord extends BaseEntity {
  readonly general: BuildingGeneralInfo;
  readonly entrance: BuildingEntranceFeature;
  readonly internalMovement: BuildingInternalMovement;
  readonly restroom: BuildingRestroomFeature;
  readonly vision: BuildingVisionFeature;
  readonly hearing: BuildingHearingFeature;
  readonly comfort: BuildingComfortFeature;
}
