/**
 * Building Assessment Local Storage Repository
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { BuildingAssessmentRecord, EvidenceItem } from "../../types/assessment.ts";
import { SAMPLE_BUILDING_ASSESSMENTS } from "./sample-data.ts";

const ASSESSMENTS_STORAGE_KEY = "accessmate_building_assessments";

/**
 * Creates an evidence container defaulting to "unknown" status.
 * This guarantees unmeasured features are never misconstrued as absent or present.
 */
export function createUnknownEvidence<T>(defaultValue: T): EvidenceItem<T> {
  return {
    value: defaultValue,
    status: "unknown",
  };
}

/**
 * Generates an empty, well-typed assessment template ready for user input.
 */
export function createEmptyAssessment(): BuildingAssessmentRecord {
  const now = new Date().toISOString();
  return {
    id: `assessment-${Date.now()}`,
    general: {
      name: "",
      buildingType: "public_facility",
      address: "",
      floorsCount: 1,
      assessmentDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
    entrance: {
      stepFreeAccess: createUnknownEvidence(false),
      rampAvailability: createUnknownEvidence(false),
      rampSlopePercent: createUnknownEvidence<number | null>(null),
      rampHasHandrails: createUnknownEvidence(false),
      stepCount: createUnknownEvidence<number | null>(null),
      stepHeightCm: createUnknownEvidence<number | null>(null),
      automaticDoors: createUnknownEvidence(false),
      doorType: createUnknownEvidence("unknown"),
      doorClearWidthCm: createUnknownEvidence<number | null>(null),
      alternativeAccessibleEntrance: createUnknownEvidence(false),
      entranceSignage: createUnknownEvidence(false),
    },
    internalMovement: {
      elevatorAvailable: createUnknownEvidence(false),
      elevatorOperationalStatus: createUnknownEvidence("unknown"),
      elevatorDoorWidthCm: createUnknownEvidence<number | null>(null),
      elevatorCabinDepthCm: createUnknownEvidence<number | null>(null),
      elevatorAudioFeedback: createUnknownEvidence(false),
      elevatorBrailleButtons: createUnknownEvidence(false),
      staircaseAvailable: createUnknownEvidence(false),
      staircaseHandrails: createUnknownEvidence(false),
      corridorClearWidthCm: createUnknownEvidence<number | null>(null),
      doorwayClearanceCm: createUnknownEvidence<number | null>(null),
      internalRamps: createUnknownEvidence(false),
      allFloorsAccessible: createUnknownEvidence(false),
    },
    restroom: {
      accessibleRestroomAvailable: createUnknownEvidence(false),
      restroomFloors: createUnknownEvidence(""),
      accessibleStallAvailable: createUnknownEvidence(false),
      grabBarsPresent: createUnknownEvidence(false),
      emergencyPullCord: createUnknownEvidence(false),
      doorClearWidthCm: createUnknownEvidence<number | null>(null),
      turningRadiusCm: createUnknownEvidence<number | null>(null),
    },
    vision: {
      tactilePaving: createUnknownEvidence(false),
      brailleSignage: createUnknownEvidence(false),
      highContrastSignage: createUnknownEvidence(false),
      audioAnnouncements: createUnknownEvidence(false),
      lightingQuality: createUnknownEvidence("unknown"),
      obstacleFreePaths: createUnknownEvidence(false),
    },
    hearing: {
      visualAnnouncements: createUnknownEvidence(false),
      writtenInstructions: createUnknownEvidence(false),
      visualEmergencyAlerts: createUnknownEvidence(false),
      informationDisplays: createUnknownEvidence(false),
      hearingLoop: createUnknownEvidence(false),
    },
    comfort: {
      seatingRestPoints: createUnknownEvidence(false),
      restPointIntervalMeters: createUnknownEvidence<number | null>(null),
      quietSpaces: createUnknownEvidence(false),
      accessibleParking: createUnknownEvidence(false),
      accessibleParkingDistanceMeters: createUnknownEvidence<number | null>(null),
      clearlyMarkedPathways: createUnknownEvidence(false),
      staffAssistanceAvailable: createUnknownEvidence(false),
    },
    createdAt: now,
    updatedAt: now,
  };
}

export const assessmentRepository = {
  /**
   * Retrieves all stored building assessments. Seeds with sample records on first launch.
   */
  getAssessments(): BuildingAssessmentRecord[] {
    if (typeof window === "undefined") {
      return SAMPLE_BUILDING_ASSESSMENTS;
    }

    try {
      const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      if (!raw) {
        // Seed with sample audits on first run
        localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(SAMPLE_BUILDING_ASSESSMENTS));
        return SAMPLE_BUILDING_ASSESSMENTS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return SAMPLE_BUILDING_ASSESSMENTS;
      }
      return parsed as BuildingAssessmentRecord[];
    } catch {
      return SAMPLE_BUILDING_ASSESSMENTS;
    }
  },

  /**
   * Retrieves a single assessment by ID.
   */
  getAssessmentById(id: string): BuildingAssessmentRecord | null {
    const list = this.getAssessments();
    return list.find((item) => item.id === id) ?? null;
  },

  /**
   * Saves or updates an assessment record.
   */
  saveAssessment(record: BuildingAssessmentRecord): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const existingList = this.getAssessments();
      const updatedRecord: BuildingAssessmentRecord = {
        ...record,
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = existingList.findIndex((item) => item.id === record.id);
      let nextList: BuildingAssessmentRecord[];

      if (existingIndex >= 0) {
        nextList = [...existingList];
        nextList[existingIndex] = updatedRecord;
      } else {
        nextList = [updatedRecord, ...existingList];
      }

      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new Event("accessmate:assessments-updated"));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Deletes a building assessment by ID.
   */
  deleteAssessment(id: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const existingList = this.getAssessments();
      const nextList = existingList.filter((item) => item.id !== id);
      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new Event("accessmate:assessments-updated"));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Resets all stored assessments back to initial seed data.
   */
  resetToSampleData(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(SAMPLE_BUILDING_ASSESSMENTS));
      window.dispatchEvent(new Event("accessmate:assessments-updated"));
      return true;
    } catch {
      return false;
    }
  },
};
