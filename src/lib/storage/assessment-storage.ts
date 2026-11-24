/**
 * Building Assessment Local Storage Repository with Enhanced Storage Safety
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { BuildingAssessmentRecord, EvidenceItem } from "../../types/assessment.ts";
import { SAMPLE_BUILDING_ASSESSMENTS } from "./sample-data.ts";
import { supabase } from "@/lib/supabase/client";

export const ASSESSMENTS_STORAGE_KEY = "accessmate_building_assessments";
export const ASSESSMENTS_CORRUPT_BACKUP_KEY = "accessmate_building_assessments_corrupt_backup";

export interface StorageHealthReport {
  readonly hasCorruptedData: boolean;
  readonly warningMessage?: string;
  readonly backedUpData?: string;
}

let inMemoryHealthReport: StorageHealthReport = {
  hasCorruptedData: false,
};

let isAssessmentsSyncInitialized = false;

async function initSupabaseAssessmentsSync() {
  if (typeof window === "undefined" || isAssessmentsSyncInitialized) return;
  isAssessmentsSyncInitialized = true;

  try {
    const { data, error } = await supabase
      .from("building_assessments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const records: BuildingAssessmentRecord[] = data.map((row) => {
        const parsed = (row.assessment_data as any) || {};
        return {
          id: row.id,
          general: {
            name: parsed.general?.name || "Building Facility",
            buildingType: parsed.general?.buildingType || "public_facility",
            address: parsed.general?.address || "",
            floorsCount: parsed.general?.floorsCount || 1,
            assessmentDate: parsed.general?.assessmentDate || row.created_at.slice(0, 10),
            notes: row.audit_notes || parsed.general?.notes || "",
          },
          entrance: parsed.entrance || SAMPLE_BUILDING_ASSESSMENTS[0]?.entrance,
          internalMovement: parsed.internalMovement || SAMPLE_BUILDING_ASSESSMENTS[0]?.internalMovement,
          restroom: parsed.restroom || SAMPLE_BUILDING_ASSESSMENTS[0]?.restroom,
        } as BuildingAssessmentRecord;
      });

      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new Event("accessmate:assessments-updated"));
    }

    supabase
      .channel("assessments-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "building_assessments" },
        async () => {
          const { data: updated } = await supabase
            .from("building_assessments")
            .select("*")
            .order("created_at", { ascending: false });

          if (updated && updated.length > 0) {
            const records: BuildingAssessmentRecord[] = updated.map((row) => {
              const parsed = (row.assessment_data as any) || {};
              return {
                id: row.id,
                general: {
                  name: parsed.general?.name || "Building Facility",
                  buildingType: parsed.general?.buildingType || "public_facility",
                  address: parsed.general?.address || "",
                  floorsCount: parsed.general?.floorsCount || 1,
                  assessmentDate: parsed.general?.assessmentDate || row.created_at.slice(0, 10),
                  notes: row.audit_notes || parsed.general?.notes || "",
                },
                entrance: parsed.entrance || SAMPLE_BUILDING_ASSESSMENTS[0]?.entrance,
                internalMovement: parsed.internalMovement || SAMPLE_BUILDING_ASSESSMENTS[0]?.internalMovement,
                restroom: parsed.restroom || SAMPLE_BUILDING_ASSESSMENTS[0]?.restroom,
              } as BuildingAssessmentRecord;
            });
            localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(records));
            window.dispatchEvent(new Event("accessmate:assessments-updated"));
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Supabase assessments sync warning:", err);
  }
}

if (typeof window !== "undefined") {
  initSupabaseAssessmentsSync();
}

/**
 * Checks whether an assessment record is seed demonstration data.
 */
export function isDemoAssessment(record: BuildingAssessmentRecord): boolean {
  return record.id.startsWith("sample-");
}

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
   * Retrieves the current storage safety health report.
   */
  getStorageHealth(): StorageHealthReport {
    if (typeof window !== "undefined") {
      try {
        const backedUp = localStorage.getItem(ASSESSMENTS_CORRUPT_BACKUP_KEY);
        if (backedUp) {
          return {
            hasCorruptedData: true,
            warningMessage:
              "Corrupted local assessment data detected. The original data has been preserved in recovery backup.",
            backedUpData: backedUp,
          };
        }
      } catch {
        // Fall back to in-memory report
      }
    }
    return inMemoryHealthReport;
  },

  /**
   * Clears the storage corruption warning after user acknowledges or resolves recovery.
   */
  clearStorageWarning(): void {
    inMemoryHealthReport = { hasCorruptedData: false };
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(ASSESSMENTS_CORRUPT_BACKUP_KEY);
      } catch {
        // ignore
      }
    }
  },

  /**
   * Retrieves all stored building assessments.
   * If local storage is empty, seeds with sample records.
   * If stored data is structurally corrupted, safely preserves raw data to a backup
   * key and does NOT silently overwrite it.
   */
  getAssessments(): BuildingAssessmentRecord[] {
    if (typeof window === "undefined") {
      return SAMPLE_BUILDING_ASSESSMENTS;
    }

    try {
      const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      if (!raw) {
        // First launch with clean storage: seed with sample audits
        localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(SAMPLE_BUILDING_ASSESSMENTS));
        return SAMPLE_BUILDING_ASSESSMENTS;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Malformed JSON: preserve corrupted string for recovery, do not silently overwrite
        localStorage.setItem(ASSESSMENTS_CORRUPT_BACKUP_KEY, raw);
        inMemoryHealthReport = {
          hasCorruptedData: true,
          warningMessage:
            "Warning: Assessment storage contained invalid JSON. Original content was preserved in recovery backup.",
          backedUpData: raw,
        };
        window.dispatchEvent(new Event("accessmate:storage-health-alert"));
        return [];
      }

      if (!Array.isArray(parsed)) {
        // Structurally invalid: preserve for recovery
        localStorage.setItem(ASSESSMENTS_CORRUPT_BACKUP_KEY, raw);
        inMemoryHealthReport = {
          hasCorruptedData: true,
          warningMessage:
            "Warning: Assessment storage was not a valid array. Original content was preserved in recovery backup.",
          backedUpData: raw,
        };
        window.dispatchEvent(new Event("accessmate:storage-health-alert"));
        return [];
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
   * Resets all stored assessments back to initial seed demonstration data.
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
