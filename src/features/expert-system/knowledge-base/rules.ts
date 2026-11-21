/**
 * Knowledge Base Rules
 * 24 Expert Rules spanning Mobility, Elevators, Vision, Hearing, Stamina, Sensory, Uncertainty & Synthesis.
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { KnowledgeRule } from "../types.ts";

export const KNOWLEDGE_RULES: readonly KnowledgeRule[] = [
  // ==========================================
  // Category A: Mobility Accessibility
  // ==========================================
  {
    id: "MOB-001",
    name: "Essential Step-Free Entrance Access",
    category: "Mobility Accessibility",
    description:
      "Identifies a critical access barrier when a user requiring step-free access faces stairs at the main entrance with no verified alternative.",
    priority: 100,
    conditions: [
      {
        factKey: "req:mobility:step_free",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires essential step-free access",
      },
      {
        factKey: "env:mobility:step_free",
        operator: "equals",
        expectedValue: false,
        requiredEvidenceStatus: ["verified", "user_reported"],
        description: "Main entrance has confirmed steps / is not step-free",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:step_free");
      const env = wm.get("env:mobility:step_free");
      if (!req || req.value !== "essential") return null;

      const isNotStepFree = env && env.value === false && (env.evidenceStatus === "verified" || env.evidenceStatus === "user_reported");
      const stepCount = wm.get("env:mobility:step_count");
      const hasSteps = stepCount && typeof stepCount.value === "number" && stepCount.value > 0;
      const ramp = wm.get("env:mobility:ramp_available");
      const hasRamp = ramp && ramp.value === true;

      if ((isNotStepFree || hasSteps) && !hasRamp) {
        return {
          barrier: {
            title: "Main Entrance Has Steps (Step-Free Ingress Required)",
            description:
              "User has an essential requirement for step-free access, but the main entrance has confirmed stairs without a ramp.",
            severity: "critical",
            impactedDimension: "mobility",
            recommendedAction:
              "Contact facility management before visiting to confirm whether a usable step-free entrance or temporary ramp is available.",
          },
          summaryNote: "Critical barrier: Essential step-free entrance unmet.",
        };
      }
      return null;
    },
  },

  {
    id: "MOB-002",
    name: "Alternative Accessible Entrance Available",
    category: "Mobility Accessibility",
    description:
      "Identifies when an alternative accessible entrance successfully compensates for main entrance stairs.",
    priority: 95,
    conditions: [
      {
        factKey: "req:mobility:step_free",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires step-free access",
      },
      {
        factKey: "env:mobility:alternative_accessible_entrance",
        operator: "equals",
        expectedValue: true,
        requiredEvidenceStatus: ["verified"],
        description: "Alternative accessible entrance is verified available",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:step_free");
      if (!req || (req.value !== "essential" && req.value !== "preferred")) return null;

      const alt = wm.get("env:mobility:alternative_accessible_entrance");
      if (alt && alt.value === true && alt.evidenceStatus === "verified") {
        return {
          strength: {
            title: "Verified Alternative Step-Free Ingress",
            description:
              "An alternative step-free entrance is verified available, providing an accessible bypass for main entrance stairs.",
            dimension: "mobility",
          },
          derivedFact: {
            key: "derived:mobility:step_free_resolved_by_arrangement",
            category: "derived",
            attribute: "step_free_resolved",
            value: true,
            evidenceStatus: "verified",
            notes: "Resolved via verified alternative entrance.",
          },
          summaryNote: "Alternative accessible entrance verified.",
        };
      }
      return null;
    },
  },

  {
    id: "MOB-003",
    name: "Doorway Clear Width Clearance Restriction",
    category: "Mobility Accessibility",
    description:
      "Identifies a barrier when an essential entrance or internal door is narrower than the user's configured device requirement.",
    priority: 90,
    conditions: [
      {
        factKey: "req:mobility:min_doorway_width_cm",
        operator: "is_not_null",
        description: "User has a minimum doorway width requirement",
      },
      {
        factKey: "env:mobility:door_clear_width_cm",
        operator: "is_not_null",
        description: "Door clear opening width is measured",
      },
    ],
    evaluate(wm) {
      const reqWidth = wm.get("req:mobility:min_doorway_width_cm");
      const envWidth = wm.get("env:mobility:door_clear_width_cm");

      if (
        reqWidth &&
        typeof reqWidth.value === "number" &&
        envWidth &&
        typeof envWidth.value === "number" &&
        (envWidth.evidenceStatus === "verified" || envWidth.evidenceStatus === "user_reported")
      ) {
        if (envWidth.value < reqWidth.value) {
          const usesWheelchair = wm.get("req:mobility:uses_wheelchair")?.value === true;
          return {
            barrier: {
              title: `Doorway Width Restricted (${envWidth.value}cm vs ${reqWidth.value}cm required)`,
              description: `The clear door opening width is ${envWidth.value}cm, which is narrower than the user's required threshold of ${reqWidth.value}cm for safe passage.`,
              severity: usesWheelchair ? "critical" : "high",
              impactedDimension: "mobility",
              recommendedAction:
                "Verify whether secondary double doors can be unlatched or if automated wide leaves are available.",
            },
            summaryNote: "Doorway clearance restriction identified.",
          };
        }
      }
      return null;
    },
  },

  {
    id: "MOB-004",
    name: "Entrance Ramp Gradient Slope Exceeds Tolerance",
    category: "Mobility Accessibility",
    description:
      "Detects when a ramp slope exceeds the user's configured physical incline tolerance.",
    priority: 85,
    conditions: [
      {
        factKey: "req:mobility:max_ramp_slope_percent",
        operator: "is_not_null",
        description: "User has a maximum ramp slope limit",
      },
      {
        factKey: "env:mobility:ramp_slope_percent",
        operator: "is_not_null",
        description: "Ramp slope is recorded",
      },
    ],
    evaluate(wm) {
      const reqSlope = wm.get("req:mobility:max_ramp_slope_percent");
      const envSlope = wm.get("env:mobility:ramp_slope_percent");

      if (
        reqSlope &&
        typeof reqSlope.value === "number" &&
        envSlope &&
        typeof envSlope.value === "number" &&
        (envSlope.evidenceStatus === "verified" || envSlope.evidenceStatus === "user_reported")
      ) {
        if (envSlope.value > reqSlope.value) {
          return {
            barrier: {
              title: `Ramp Gradient Too Steep (${envSlope.value}% vs max ${reqSlope.value}%)`,
              description: `Entrance ramp slope of ${envSlope.value}% exceeds the user's safe incline threshold of ${reqSlope.value}%.`,
              severity: "high",
              impactedDimension: "mobility",
              recommendedAction:
                "Confirm if companion assistance is available or whether a low-gradient bypass route exists.",
            },
            summaryNote: "Ramp incline exceeds user tolerance limit.",
          };
        }
      }
      return null;
    },
  },

  {
    id: "MOB-005",
    name: "Stair & Ramp Handrail Deficiency",
    category: "Mobility Accessibility",
    description:
      "Detects absent handrails for individuals requiring hand support for balance and stair ascent.",
    priority: 80,
    conditions: [
      {
        factKey: "req:mobility:handrails",
        operator: "in",
        expectedValue: ["essential", "preferred"],
        description: "User requires handrails",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:handrails");
      if (!req || (req.value !== "essential" && req.value !== "preferred")) return null;

      const rampHandrails = wm.get("env:mobility:ramp_handrails");
      const stairHandrails = wm.get("env:elevator:staircase_handrails");

      const missingRampRails = rampHandrails && rampHandrails.value === false && rampHandrails.evidenceStatus !== "not_applicable";
      const missingStairRails = stairHandrails && stairHandrails.value === false && stairHandrails.evidenceStatus !== "not_applicable";

      if (missingRampRails || missingStairRails) {
        return {
          barrier: {
            title: "Handrails Absent on Staircases or Ramps",
            description:
              "User requires sturdy bilateral handrails for balance, but physical handrails are confirmed absent along vertical level changes.",
            severity: req.value === "essential" ? "high" : "medium",
            impactedDimension: "mobility",
            recommendedAction: "Use alternative elevator routes to bypass handrail-deficient stairs.",
          },
          summaryNote: "Handrail deficiency detected.",
        };
      }
      return null;
    },
  },

  {
    id: "MOB-006",
    name: "Preferred Step-Free Access Unmet",
    category: "Mobility Accessibility",
    description:
      "Records a moderate usability barrier when a user prefers step-free access but the venue has stairs.",
    priority: 75,
    conditions: [
      {
        factKey: "req:mobility:step_free",
        operator: "equals",
        expectedValue: "preferred",
        description: "User prefers step-free access",
      },
      {
        factKey: "env:mobility:step_free",
        operator: "equals",
        expectedValue: false,
        description: "Entrance is not step-free",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:step_free");
      const env = wm.get("env:mobility:step_free");
      if (req && req.value === "preferred" && env && env.value === false) {
        return {
          barrier: {
            title: "Entrance Has Steps (Step-Free Access Preferred)",
            description:
              "User prefers step-free access to reduce joint fatigue; facility entrance requires ascending steps.",
            severity: "medium",
            impactedDimension: "mobility",
            recommendedAction: "Allow additional travel time for navigating entrance steps.",
          },
          summaryNote: "Preferred step-free requirement unmet.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category B: Elevator and Floor Accessibility
  // ==========================================
  {
    id: "ELEV-001",
    name: "Elevator Unavailable for Multi-Floor Facility",
    category: "Elevator & Vertical Circulation",
    description:
      "Identifies a critical access barrier when an individual requiring an elevator visits a multi-floor venue where the elevator is absent or broken.",
    priority: 100,
    conditions: [
      {
        factKey: "req:mobility:elevator_levels",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires elevator for multi-floor movement",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:elevator_levels");
      if (!req || req.value !== "essential") return null;

      const floors = wm.get("env:general:floors_count");
      const isMultiFloor = floors && typeof floors.value === "number" && floors.value > 1;
      if (!isMultiFloor) return null;

      const elevatorAvailable = wm.get("env:elevator:elevator_available");
      const elevatorStatus = wm.get("env:elevator:elevator_operational_status");

      const isBroken = elevatorStatus && elevatorStatus.value === "out_of_service";
      const isAbsent = elevatorAvailable && elevatorAvailable.value === false;

      if (isBroken || isAbsent) {
        return {
          barrier: {
            title: `Multi-Floor Access Blocked: Elevator ${isBroken ? "Out of Service" : "Absent"}`,
            description: `The facility has ${floors.value} floors, but the elevator is ${
              isBroken ? "confirmed out of service" : "not installed"
            }. Upper floors cannot be reached.`,
            severity: "critical",
            impactedDimension: "mobility",
            recommendedAction:
              "Contact the building administrator to arrange ground-floor service or postpone visit.",
          },
          summaryNote: "Critical barrier: Multi-floor elevator unavailable.",
        };
      }
      return null;
    },
  },

  {
    id: "ELEV-002",
    name: "Elevator Operational Status Unknown",
    category: "Elevator & Vertical Circulation",
    description:
      "Flags an information gap when vertical circulation depends on an elevator whose operational reliability is unknown.",
    priority: 85,
    conditions: [
      {
        factKey: "req:mobility:elevator_levels",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires elevator",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:elevator_levels");
      if (!req || req.value !== "essential") return null;

      const floors = wm.get("env:general:floors_count");
      if (!floors || typeof floors.value !== "number" || floors.value <= 1) return null;

      const elevatorAvailable = wm.get("env:elevator:elevator_available");
      const elevatorStatus = wm.get("env:elevator:elevator_operational_status");

      if (
        (elevatorAvailable && elevatorAvailable.evidenceStatus === "unknown") ||
        (elevatorStatus && (elevatorStatus.value === "unknown" || elevatorStatus.evidenceStatus === "unknown"))
      ) {
        return {
          informationGap: {
            feature: "Elevator Operational Reliability",
            dimension: "mobility",
            whyNeeded: "Multi-floor building access depends on operational elevator equipment.",
            recommendedVerification:
              "Call the venue facility desk on the day of travel to verify elevator operational health.",
          },
          summaryNote: "Information gap: Elevator operational status unknown.",
        };
      }
      return null;
    },
  },

  {
    id: "ELEV-003",
    name: "Accessible Restroom on Unreachable Floor",
    category: "Elevator & Vertical Circulation",
    description:
      "Detects when an accessible sanitary facility exists in the building but is situated on a level the traveler cannot reach.",
    priority: 95,
    conditions: [
      {
        factKey: "req:mobility:accessible_restroom",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires accessible restroom",
      },
    ],
    evaluate(wm) {
      const reqRestroom = wm.get("req:mobility:accessible_restroom");
      if (!reqRestroom || reqRestroom.value !== "essential") return null;

      const hasRestroom = wm.get("env:restroom:accessible_restroom_available");
      if (!hasRestroom || hasRestroom.value !== true) return null;

      const floors = wm.get("env:general:floors_count");
      const isMultiFloor = floors && typeof floors.value === "number" && floors.value > 1;

      const elevatorAvailable = wm.get("env:elevator:elevator_available");
      const elevatorStatus = wm.get("env:elevator:elevator_operational_status");
      const elevatorBlocked =
        (elevatorAvailable && elevatorAvailable.value === false) ||
        (elevatorStatus && elevatorStatus.value === "out_of_service");

      const restroomFloors = wm.get("env:restroom:restroom_floors");
      const isUpperFloorRestroom =
        restroomFloors &&
        typeof restroomFloors.value === "string" &&
        !restroomFloors.value.toLowerCase().includes("ground") &&
        !restroomFloors.value.toLowerCase().includes("level 1");

      if (isMultiFloor && elevatorBlocked && isUpperFloorRestroom) {
        return {
          barrier: {
            title: "Accessible Restroom Located on Inaccessible Upper Level",
            description:
              "An accessible restroom exists, but it is located on an upper floor that cannot be reached due to an unavailable elevator.",
            severity: "critical",
            impactedDimension: "restroom",
            recommendedAction:
              "Inquire if an accessible ground-level staff restroom can be made available during the visit.",
          },
          summaryNote: "Critical barrier: Accessible restroom unreachable.",
        };
      }
      return null;
    },
  },

  {
    id: "ELEV-004",
    name: "Verified Operational Elevator with Assistive Features",
    category: "Elevator & Vertical Circulation",
    description:
      "Records an accessibility strength when an elevator is operational with braille and audio features.",
    priority: 70,
    conditions: [],
    evaluate(wm) {
      const elevatorAvailable = wm.get("env:elevator:elevator_available");
      const elevatorStatus = wm.get("env:elevator:elevator_operational_status");

      if (
        elevatorAvailable &&
        elevatorAvailable.value === true &&
        elevatorStatus &&
        elevatorStatus.value === "operational" &&
        elevatorStatus.evidenceStatus === "verified"
      ) {
        return {
          strength: {
            title: "Verified Operational Elevator",
            description: "Vertical elevator circulation is verified operational and monitored.",
            dimension: "mobility",
          },
          summaryNote: "Strength: Verified operational elevator.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category C: Vision Accessibility
  // ==========================================
  {
    id: "VIS-001",
    name: "Tactile Ground Surface Paving Missing",
    category: "Vision Accessibility",
    description:
      "Detects absence of tactile ground surface indicators for travelers who require tactile wayfinding.",
    priority: 85,
    conditions: [
      {
        factKey: "req:vision:tactile_paving",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires tactile ground paving",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:vision:tactile_paving");
      if (!req || req.value !== "essential") return null;

      const env = wm.get("env:vision:tactile_paving");
      if (env && env.value === false && (env.evidenceStatus === "verified" || env.evidenceStatus === "user_reported")) {
        return {
          barrier: {
            title: "Tactile Ground Surface Paving Absent",
            description:
              "User requires tactile ground indicators for cane navigation, but guidance blisters and directional ridges are confirmed absent.",
            severity: "high",
            impactedDimension: "vision",
            recommendedAction: "Request human guide assistance upon arrival at the facility.",
          },
          summaryNote: "Vision barrier: Tactile paving absent.",
        };
      }
      return null;
    },
  },

  {
    id: "VIS-002",
    name: "High-Contrast Visual Signage Deficiency",
    category: "Vision Accessibility",
    description:
      "Identifies poor luminance contrast or unreadable visual signage for low vision travelers.",
    priority: 80,
    conditions: [
      {
        factKey: "req:vision:high_contrast_signage",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires high-contrast signage",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:vision:high_contrast_signage");
      if (!req || req.value !== "essential") return null;

      const env = wm.get("env:vision:high_contrast_signage");
      if (env && env.value === false && (env.evidenceStatus === "verified" || env.evidenceStatus === "user_reported")) {
        return {
          barrier: {
            title: "High-Contrast Wayfinding Signage Absent",
            description:
              "Facility directional signage lacks compliant luminance contrast and large print required for low vision wayfinding.",
            severity: "medium",
            impactedDimension: "vision",
            recommendedAction: "Download or print high-contrast facility maps prior to arrival.",
          },
          summaryNote: "Vision barrier: Inadequate signage contrast.",
        };
      }
      return null;
    },
  },

  {
    id: "VIS-003",
    name: "Tactile / Braille Wayfinding Status Unknown",
    category: "Vision Accessibility",
    description:
      "Identifies information gaps when essential visual and tactile guidance features have not been surveyed.",
    priority: 75,
    conditions: [
      {
        factKey: "req:vision:tactile_paving",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires tactile paving",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:vision:tactile_paving");
      if (!req || req.value !== "essential") return null;

      const env = wm.get("env:vision:tactile_paving");
      if (env && env.evidenceStatus === "unknown") {
        return {
          informationGap: {
            feature: "Tactile Ground Surface Indicators",
            dimension: "vision",
            whyNeeded: "Essential for non-visual and cane-guided navigation.",
            recommendedVerification:
              "Verify with the venue whether tactile indicators exist between the entrance and reception.",
          },
          summaryNote: "Information gap: Tactile paving status unmeasured.",
        };
      }
      return null;
    },
  },

  {
    id: "VIS-004",
    name: "Verified Tactile and Audio Wayfinding Features",
    category: "Vision Accessibility",
    description: "Records an accessibility strength when tactile paving and audio cues are verified.",
    priority: 65,
    conditions: [],
    evaluate(wm) {
      const paving = wm.get("env:vision:tactile_paving");
      const audio = wm.get("env:vision:audio_announcements");

      if (paving && paving.value === true && audio && audio.value === true && paving.evidenceStatus === "verified") {
        return {
          strength: {
            title: "Verified Tactile and Acoustic Wayfinding",
            description: "Tactile ground paving and automated spoken audio announcements are verified active.",
            dimension: "vision",
          },
          summaryNote: "Strength: Tactile and audio wayfinding present.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category D: Hearing Accessibility
  // ==========================================
  {
    id: "HEAR-001",
    name: "Audio-Only Announcements / Missing Visual Displays",
    category: "Hearing Accessibility",
    description:
      "Detects communication barriers when arrival or service updates are broadcast exclusively via audio.",
    priority: 85,
    conditions: [
      {
        factKey: "req:hearing:visual_announcements",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires visual announcements",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:hearing:visual_announcements");
      if (!req || req.value !== "essential") return null;

      const env = wm.get("env:hearing:visual_announcements");
      if (env && env.value === false && (env.evidenceStatus === "verified" || env.evidenceStatus === "user_reported")) {
        return {
          barrier: {
            title: "Auditory-Only Announcements (No Digital Display Boards)",
            description:
              "Public announcements are delivered via loudspeaker without synchronized real-time visual display screens.",
            severity: "high",
            impactedDimension: "hearing",
            recommendedAction: "Request written confirmation or text alerts for scheduling updates.",
          },
          summaryNote: "Communication barrier: Audio-only announcements.",
        };
      }
      return null;
    },
  },

  {
    id: "HEAR-002",
    name: "Verified Visual Emergency Alarms Present",
    category: "Hearing Accessibility",
    description:
      "Records a supporting safety feature when emergency strobes are verified active.",
    priority: 75,
    conditions: [],
    evaluate(wm) {
      const alerts = wm.get("env:hearing:visual_emergency_alerts");
      if (alerts && alerts.value === true && alerts.evidenceStatus === "verified") {
        return {
          strength: {
            title: "Verified Visual Emergency Strobe Alarms",
            description: "Emergency warning systems include synchronized flashing visual strobe beacons.",
            dimension: "hearing",
          },
          summaryNote: "Strength: Visual emergency strobe alarms verified.",
        };
      }
      return null;
    },
  },

  {
    id: "HEAR-003",
    name: "Hearing Induction Loop System Verified",
    category: "Hearing Accessibility",
    description: "Identifies supporting assistive technology for travelers using T-coil hearing aids.",
    priority: 70,
    conditions: [],
    evaluate(wm) {
      const loop = wm.get("env:hearing:hearing_loop");
      if (loop && loop.value === true && loop.evidenceStatus === "verified") {
        return {
          strength: {
            title: "Active Hearing Induction Loop (T-Coil)",
            description: "Induction hearing loop systems are verified present at service desks.",
            dimension: "hearing",
          },
          summaryNote: "Strength: Hearing loop system verified.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category E: Stamina and Temporary Mobility Limitations
  // ==========================================
  {
    id: "STAM-001",
    name: "Walking Distance Exceeds Endurance Threshold",
    category: "Stamina & Endurance",
    description:
      "Detects when parking or internal walking distances exceed the user's continuous walking capacity.",
    priority: 85,
    conditions: [
      {
        factKey: "req:mobility:max_walking_distance_meters",
        operator: "is_not_null",
        description: "User has a configured walking distance limit",
      },
    ],
    evaluate(wm) {
      const reqDist = wm.get("req:mobility:max_walking_distance_meters");
      const parkDist = wm.get("env:stamina:accessible_parking_distance_meters");

      if (
        reqDist &&
        typeof reqDist.value === "number" &&
        parkDist &&
        typeof parkDist.value === "number" &&
        (parkDist.evidenceStatus === "verified" || parkDist.evidenceStatus === "user_reported")
      ) {
        if (parkDist.value > reqDist.value) {
          return {
            barrier: {
              title: `Walking Distance to Entrance Exceeds Limit (${parkDist.value}m vs max ${reqDist.value}m)`,
              description: `Parking distance of ${parkDist.value} meters exceeds the user's continuous walking limit of ${reqDist.value} meters without rest.`,
              severity: "high",
              impactedDimension: "stamina_endurance",
              recommendedAction:
                "Arrange for curbside drop-off immediately adjacent to the main entrance.",
            },
            summaryNote: "Stamina barrier: Walking distance limit exceeded.",
          };
        }
      }
      return null;
    },
  },

  {
    id: "STAM-002",
    name: "Rest Seating Deficient for Frequent-Rest User",
    category: "Stamina & Endurance",
    description:
      "Identifies a barrier when an individual requiring frequent rest visits a venue lacking seating.",
    priority: 80,
    conditions: [
      {
        factKey: "req:mobility:frequent_rest_stops",
        operator: "equals",
        expectedValue: "essential",
        description: "User has essential need for frequent rest seating",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:mobility:frequent_rest_stops");
      if (!req || req.value !== "essential") return null;

      const seating = wm.get("env:stamina:seating_rest_points");
      if (seating && seating.value === false && (seating.evidenceStatus === "verified" || seating.evidenceStatus === "user_reported")) {
        return {
          barrier: {
            title: "Rest Seating Absent Along Circulation Paths",
            description:
              "User requires frequent rest seating to manage stamina, but benches and seating points are confirmed absent along primary corridors.",
            severity: "high",
            impactedDimension: "stamina_endurance",
            recommendedAction: "Request a portable lightweight seat or wheelchair assistance.",
          },
          summaryNote: "Stamina barrier: Rest seating absent.",
        };
      }
      return null;
    },
  },

  {
    id: "STAM-003",
    name: "Acute Temporary Injury Restricted by Stairs",
    category: "Stamina & Endurance",
    description:
      "Detects when a temporary injury (e.g. crutches, cast) conflicts with a stairs-only facility.",
    priority: 90,
    conditions: [
      {
        factKey: "req:temporary:has_limitation",
        operator: "equals",
        expectedValue: true,
        description: "User has an active temporary limitation",
      },
    ],
    evaluate(wm) {
      const hasTemp = wm.get("req:temporary:has_limitation");
      if (!hasTemp || hasTemp.value !== true) return null;

      const stairDifficulty = wm.get("req:temporary:difficulty_using_stairs")?.value === true;
      const isNotStepFree = wm.get("env:mobility:step_free")?.value === false;

      if (stairDifficulty && isNotStepFree) {
        return {
          barrier: {
            title: "Temporary Injury Barrier: Entrance Requires Stairs",
            description:
              "User has an active acute injury preventing stair climbing, but the facility entrance has stairs.",
            severity: "high",
            impactedDimension: "temporary",
            recommendedAction:
              "Inquire if staff can assist with a ramp or use an alternative step-free service.",
          },
          summaryNote: "Temporary limitation barrier: Acute stair difficulty.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category F: Sensory and Cognitive Accessibility
  // ==========================================
  {
    id: "SENS-001",
    name: "Low-Noise Sensory Environment Unmet",
    category: "Sensory & Cognitive Accessibility",
    description:
      "Identifies sensory overload risk when quiet spaces are absent for a sensory-sensitive user.",
    priority: 75,
    conditions: [
      {
        factKey: "req:sensory:quiet_environment",
        operator: "in",
        expectedValue: ["essential", "preferred"],
        description: "User requires or prefers quieter environments",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:sensory:quiet_environment");
      if (!req || (req.value !== "essential" && req.value !== "preferred")) return null;

      const quietSpaces = wm.get("env:sensory:quiet_spaces");
      if (quietSpaces && quietSpaces.value === false && (quietSpaces.evidenceStatus === "verified" || quietSpaces.evidenceStatus === "user_reported")) {
        return {
          barrier: {
            title: "Dedicated Quiet / Decompression Spaces Absent",
            description:
              "Facility lacks low-stimulation sensory recharge rooms or designated quiet zones.",
            severity: req.value === "essential" ? "high" : "medium",
            impactedDimension: "sensory_cognitive",
            recommendedAction:
              "Plan visits during off-peak times and bring noise-cancelling headphones.",
          },
          summaryNote: "Sensory barrier: Quiet spaces absent.",
        };
      }
      return null;
    },
  },

  {
    id: "SENS-002",
    name: "Predictable Wayfinding & Demarcation Deficiency",
    category: "Sensory & Cognitive Accessibility",
    description:
      "Flags disorienting layouts when predictable navigation paths are essential.",
    priority: 70,
    conditions: [
      {
        factKey: "req:sensory:predictable_wayfinding",
        operator: "equals",
        expectedValue: "essential",
        description: "User requires predictable wayfinding",
      },
    ],
    evaluate(wm) {
      const req = wm.get("req:sensory:predictable_wayfinding");
      if (!req || req.value !== "essential") return null;

      const marked = wm.get("env:sensory:clearly_marked_routes");
      const lighting = wm.get("env:vision:lighting_quality");

      const poorLighting = lighting && (lighting.value === "flickering" || lighting.value === "dim");
      const unmarkedRoutes = marked && marked.value === false;

      if (poorLighting || unmarkedRoutes) {
        return {
          barrier: {
            title: "Circulation Pathways Lack Clear Visual Demarcation",
            description:
              "Navigation routes lack distinct wayfinding cues or feature flickering illumination that creates disorientation.",
            severity: "medium",
            impactedDimension: "sensory_cognitive",
            recommendedAction:
              "Obtain a detailed facility schematic before entering unfamiliar corridors.",
          },
          summaryNote: "Sensory barrier: Wayfinding demarcation deficiency.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category G: Evidence, Uncertainty & Conflicts
  // ==========================================
  {
    id: "UNC-001",
    name: "Critical Accessibility Feature Unknown",
    category: "Evidence & Uncertainty",
    description:
      "Enforces scientific rigor by flagging unmeasured essential attributes as information gaps.",
    priority: 95,
    conditions: [],
    evaluate(wm) {
      const reqStepFree = wm.get("req:mobility:step_free")?.value === "essential";
      const envStepFree = wm.get("env:mobility:step_free");

      if (reqStepFree && envStepFree && envStepFree.evidenceStatus === "unknown") {
        return {
          informationGap: {
            feature: "Entrance Step-Free Verification",
            dimension: "mobility",
            whyNeeded: "Essential for wheeled mobility; cannot assume entrance is level without data.",
            recommendedVerification:
              "Contact the facility to measure step riser height or confirm ramp existence.",
          },
          summaryNote: "Information gap: Step-free access unmeasured.",
        };
      }
      return null;
    },
  },

  {
    id: "UNC-002",
    name: "Contradictory Observation Conflict",
    category: "Evidence & Uncertainty",
    description:
      "Detects when contradictory evidence exists in the survey (e.g. marked step-free, yet positive step count recorded).",
    priority: 98,
    conditions: [],
    evaluate(wm) {
      const stepFree = wm.get("env:mobility:step_free");
      const stepCount = wm.get("env:mobility:step_count");
      const ramp = wm.get("env:mobility:ramp_available");

      // Contradiction: Claims step-free access, but recorded stepCount > 0 and no ramp available
      if (
        stepFree &&
        stepFree.value === true &&
        stepCount &&
        typeof stepCount.value === "number" &&
        stepCount.value > 0 &&
        ramp &&
        ramp.value === false
      ) {
        return {
          evidenceConflict: {
            feature: "Entrance Step-Free Claims vs Step Measurement",
            description:
              "Survey records 'Step-Free Entrance: Yes', yet also logs a flight of stairs (step count > 0) with no ramp. These observations directly contradict each other.",
            conflictingSources: [
              `Step-Free Status (${stepFree.evidenceStatus})`,
              `Physical Step Count (${stepCount.evidenceStatus})`,
            ],
            recommendedAction:
              "Do not rely on the step-free claim until physical on-site photographic confirmation is obtained.",
          },
          summaryNote: "Evidence conflict: Step-free claim contradicts step count.",
        };
      }
      return null;
    },
  },

  {
    id: "UNC-003",
    name: "Unverified / Community Reported Data Flag",
    category: "Evidence & Uncertainty",
    description:
      "Maintains transparency by identifying when key accessibility claims rely on unverified reports.",
    priority: 50,
    conditions: [],
    evaluate(wm) {
      const altEntrance = wm.get("env:mobility:alternative_accessible_entrance");
      if (altEntrance && altEntrance.value === true && altEntrance.evidenceStatus === "unverified") {
        return {
          informationGap: {
            feature: "Alternative Entrance Verification",
            dimension: "mobility",
            whyNeeded:
              "An alternative accessible entrance is claimed by unconfirmed sources but has not been audited.",
            recommendedVerification: "Conduct an on-site audit to measure doorway width and ramp slope.",
          },
          summaryNote: "Provisional data: Alternative entrance unverified.",
        };
      }
      return null;
    },
  },
];
