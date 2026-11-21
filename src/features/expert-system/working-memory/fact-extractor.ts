/**
 * Fact Extractor for Working Memory
 * Converts User Accessibility Profiles and Building Assessment Records into normalized WorkingFacts.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { UserAccessibilityProfile } from "../../../types/profile.ts";
import type { BuildingAssessmentRecord, EvidenceItem } from "../../../types/assessment.ts";
import type { WorkingFact, FactCategory } from "../types.ts";

export class FactExtractor {
  /**
   * Extracts all facts from a profile and building assessment into an indexed Map.
   */
  static extract(
    profile: UserAccessibilityProfile,
    place: BuildingAssessmentRecord
  ): Map<string, WorkingFact> {
    const facts = new Map<string, WorkingFact>();

    const addProfileFact = (
      attribute: string,
      category: FactCategory,
      value: boolean | number | string | null
    ) => {
      const key = `req:${category}:${attribute}`;
      facts.set(key, {
        key,
        category,
        attribute,
        value,
        evidenceStatus: "verified", // User requirements are verified facts of user intent
        source: "profile",
      });
    };

    const addEnvFact = (
      attribute: string,
      category: FactCategory,
      evidenceItem: EvidenceItem<boolean | number | string | null>
    ) => {
      const key = `env:${category}:${attribute}`;
      facts.set(key, {
        key,
        category,
        attribute,
        value: evidenceItem.value,
        evidenceStatus: evidenceItem.status,
        source: "place_audit",
        notes: evidenceItem.notes,
        provenance: evidenceItem.source,
      });
    };

    // 1. Profile - Mobility
    addProfileFact("primary_aid", "mobility", profile.mobility.primaryAid);
    addProfileFact("uses_wheelchair", "mobility", profile.mobility.usesWheelchair);
    addProfileFact("uses_scooter", "mobility", profile.mobility.usesMobilityScooter);
    addProfileFact("uses_walking_aid", "mobility", profile.mobility.usesCrutchesOrWalkingAid);
    addProfileFact("difficulty_stairs", "mobility", profile.mobility.difficultyClimbingStairs);
    addProfileFact("step_free", "mobility", profile.mobility.requiresStepFreeAccess);
    addProfileFact("handrails", "mobility", profile.mobility.requiresHandrails);
    addProfileFact("accessible_restroom", "mobility", profile.mobility.requiresAccessibleRestroom);
    addProfileFact("elevator_levels", "mobility", profile.mobility.requiresElevatorForLevels);
    addProfileFact("frequent_rest_stops", "mobility", profile.mobility.requiresFrequentRestStops);
    addProfileFact("max_step_height_cm", "mobility", profile.mobility.maxStepHeightCm);
    addProfileFact("max_ramp_slope_percent", "mobility", profile.mobility.maxRampSlopePercent);
    addProfileFact("min_doorway_width_cm", "mobility", profile.mobility.minDoorwayWidthCm);
    addProfileFact("max_walking_distance_meters", "mobility", profile.mobility.maxWalkingDistanceMeters);
    addProfileFact("rest_stop_interval_meters", "mobility", profile.mobility.restStopIntervalMeters);

    // 2. Profile - Vision
    addProfileFact("has_blindness", "vision", profile.vision.hasBlindness);
    addProfileFact("has_low_vision", "vision", profile.vision.hasLowVision);
    addProfileFact("tactile_paving", "vision", profile.vision.requiresTactileGroundPaving);
    addProfileFact("audio_guidance", "vision", profile.vision.requiresAudioGuidance);
    addProfileFact("high_contrast_signage", "vision", profile.vision.requiresHighContrastSignage);
    addProfileFact("identifiable_entrances", "vision", profile.vision.requiresIdentifiableEntrances);
    addProfileFact("obstacle_free_paths", "vision", profile.vision.requiresObstacleFreePaths);
    addProfileFact("braille_signage", "vision", profile.vision.requiresBrailleSignage);

    // 3. Profile - Hearing
    addProfileFact("deaf_or_hard_of_hearing", "hearing", profile.hearing.isDeafOrHardOfHearing);
    addProfileFact("visual_announcements", "hearing", profile.hearing.requiresVisualAnnouncements);
    addProfileFact("written_instructions", "hearing", profile.hearing.requiresWrittenInstructions);
    addProfileFact("visual_emergency_alerts", "hearing", profile.hearing.requiresVisualEmergencyAlerts);
    addProfileFact("clear_visual_signage", "hearing", profile.hearing.requiresClearVisualSignage);
    addProfileFact("hearing_loop", "hearing", profile.hearing.requiresHearingLoop);

    // 4. Profile - Sensory
    addProfileFact("quiet_environment", "sensory", profile.sensory.prefersQuieterEnvironments);
    addProfileFact("predictable_wayfinding", "sensory", profile.sensory.requiresPredictableWayfinding);
    addProfileFact("simple_signage", "sensory", profile.sensory.prefersSimpleSignage);
    addProfileFact("reduced_sensory", "sensory", profile.sensory.requiresReducedSensoryStimulation);
    addProfileFact("clearly_marked_routes", "sensory", profile.sensory.prefersClearlyMarkedRoutes);

    // 5. Profile - Temporary
    addProfileFact("has_limitation", "temporary", profile.temporary.hasTemporaryLimitation);
    addProfileFact("temporary_injury", "temporary", profile.temporary.temporaryInjury);
    addProfileFact("limited_walking_endurance", "temporary", profile.temporary.limitedWalkingEndurance);
    addProfileFact("difficulty_using_stairs", "temporary", profile.temporary.difficultyUsingStairs);
    addProfileFact("temporary_crutches", "temporary", profile.temporary.temporaryUseOfCrutches);
    addProfileFact("expected_duration_days", "temporary", profile.temporary.expectedDurationDays);

    // 6. Environment - General
    facts.set("env:general:floors_count", {
      key: "env:general:floors_count",
      category: "general",
      attribute: "floors_count",
      value: place.general.floorsCount,
      evidenceStatus: "verified",
      source: "place_audit",
    });

    // 7. Environment - Entrance
    addEnvFact("step_free", "mobility", place.entrance.stepFreeAccess);
    addEnvFact("ramp_available", "mobility", place.entrance.rampAvailability);
    addEnvFact("ramp_slope_percent", "mobility", place.entrance.rampSlopePercent);
    addEnvFact("ramp_handrails", "mobility", place.entrance.rampHasHandrails);
    addEnvFact("step_count", "mobility", place.entrance.stepCount);
    addEnvFact("step_height_cm", "mobility", place.entrance.stepHeightCm);
    addEnvFact("automatic_doors", "mobility", place.entrance.automaticDoors);
    addEnvFact("door_type", "mobility", place.entrance.doorType);
    addEnvFact("door_clear_width_cm", "mobility", place.entrance.doorClearWidthCm);
    addEnvFact("alternative_accessible_entrance", "mobility", place.entrance.alternativeAccessibleEntrance);
    addEnvFact("entrance_signage", "mobility", place.entrance.entranceSignage);

    // 8. Environment - Internal Movement
    addEnvFact("elevator_available", "elevator", place.internalMovement.elevatorAvailable);
    addEnvFact("elevator_operational_status", "elevator", place.internalMovement.elevatorOperationalStatus);
    addEnvFact("elevator_door_width_cm", "elevator", place.internalMovement.elevatorDoorWidthCm);
    addEnvFact("elevator_cabin_depth_cm", "elevator", place.internalMovement.elevatorCabinDepthCm);
    addEnvFact("elevator_audio_feedback", "elevator", place.internalMovement.elevatorAudioFeedback);
    addEnvFact("elevator_braille_buttons", "elevator", place.internalMovement.elevatorBrailleButtons);
    addEnvFact("staircase_available", "elevator", place.internalMovement.staircaseAvailable);
    addEnvFact("staircase_handrails", "elevator", place.internalMovement.staircaseHandrails);
    addEnvFact("corridor_clear_width_cm", "elevator", place.internalMovement.corridorClearWidthCm);
    addEnvFact("all_floors_accessible", "elevator", place.internalMovement.allFloorsAccessible);

    // 9. Environment - Restroom
    addEnvFact("accessible_restroom_available", "restroom", place.restroom.accessibleRestroomAvailable);
    addEnvFact("restroom_floors", "restroom", place.restroom.restroomFloors);
    addEnvFact("accessible_stall_available", "restroom", place.restroom.accessibleStallAvailable);
    addEnvFact("grab_bars_present", "restroom", place.restroom.grabBarsPresent);
    addEnvFact("emergency_pull_cord", "restroom", place.restroom.emergencyPullCord);
    addEnvFact("restroom_door_width_cm", "restroom", place.restroom.doorClearWidthCm);
    addEnvFact("turning_radius_cm", "restroom", place.restroom.turningRadiusCm);

    // 10. Environment - Vision
    addEnvFact("tactile_paving", "vision", place.vision.tactilePaving);
    addEnvFact("braille_signage", "vision", place.vision.brailleSignage);
    addEnvFact("high_contrast_signage", "vision", place.vision.highContrastSignage);
    addEnvFact("audio_announcements", "vision", place.vision.audioAnnouncements);
    addEnvFact("lighting_quality", "vision", place.vision.lightingQuality);
    addEnvFact("obstacle_free_paths", "vision", place.vision.obstacleFreePaths);

    // 11. Environment - Hearing
    addEnvFact("visual_announcements", "hearing", place.hearing.visualAnnouncements);
    addEnvFact("written_instructions", "hearing", place.hearing.writtenInstructions);
    addEnvFact("visual_emergency_alerts", "hearing", place.hearing.visualEmergencyAlerts);
    addEnvFact("information_displays", "hearing", place.hearing.informationDisplays);
    addEnvFact("hearing_loop", "hearing", place.hearing.hearingLoop);

    // 12. Environment - Comfort & Stamina
    addEnvFact("seating_rest_points", "stamina", place.comfort.seatingRestPoints);
    addEnvFact("rest_point_interval_meters", "stamina", place.comfort.restPointIntervalMeters);
    addEnvFact("quiet_spaces", "sensory", place.comfort.quietSpaces);
    addEnvFact("accessible_parking", "mobility", place.comfort.accessibleParking);
    addEnvFact("accessible_parking_distance_meters", "stamina", place.comfort.accessibleParkingDistanceMeters);
    addEnvFact("clearly_marked_pathways", "sensory", place.comfort.clearlyMarkedPathways);
    addEnvFact("staff_assistance_available", "general", place.comfort.staffAssistanceAvailable);

    return facts;
  }
}
