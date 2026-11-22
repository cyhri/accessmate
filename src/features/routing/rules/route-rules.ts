/**
 * Route-Specific Accessibility Knowledge Base Rules
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System (Phase 5)
 */

import type { UserAccessibilityProfile } from "../../../types/profile.ts";
import type { FullRoutePlan } from "../types.ts";
import type { RuleConclusion } from "../../expert-system/types.ts";

export interface RouteKnowledgeRule {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly priority: number;
  readonly evaluate: (
    profile: UserAccessibilityProfile,
    route: FullRoutePlan
  ) => RuleConclusion | null;
}

export const ROUTE_KNOWLEDGE_RULES: readonly RouteKnowledgeRule[] = [
  // ==========================================
  // Category A: Route Mobility & Step Obstacles
  // ==========================================
  {
    id: "ROUTE-MOB-001",
    name: "Essential Step-Free Route Barrier",
    category: "Route Mobility",
    description: "Detects confirmed stairs or steps along a route for a user requiring step-free passage.",
    priority: 100,
    evaluate(profile, route) {
      const needsStepFree =
        profile.mobility.requiresStepFreeAccess === "essential" ||
        profile.mobility.usesWheelchair ||
        profile.mobility.usesMobilityScooter;

      if (!needsStepFree) return null;

      if (route.characteristics.hasKnownSteps || route.characteristics.knownStepsCount > 0) {
        return {
          barrier: {
            title: `Route Contains Stairs (${route.characteristics.knownStepsCount} Steps Logged)`,
            description:
              "Confirmed steps or stairs are present along this route segment, directly blocking independent passage for wheeled mobility.",
            severity: "critical",
            impactedDimension: "mobility",
            recommendedAction: "Select an alternative pedestrian route or detour around the stairway segment.",
          },
          summaryNote: "Critical route barrier: Confirmed stairs along pathway.",
        };
      }
      return null;
    },
  },

  {
    id: "ROUTE-MOB-002",
    name: "Steep Incline Slope Exceeds Tolerance",
    category: "Route Mobility",
    description: "Detects street gradients exceeding the user's safe ramp or hill incline threshold.",
    priority: 90,
    evaluate(profile, route) {
      const userMaxSlope = profile.mobility.maxRampSlopePercent ?? (profile.mobility.usesWheelchair ? 6 : null);
      if (typeof userMaxSlope !== "number") return null;

      const maxRouteIncline = route.characteristics.maxInclinePercent;
      if (maxRouteIncline > userMaxSlope) {
        const isSevere = maxRouteIncline >= 10 && profile.mobility.usesWheelchair;
        return {
          barrier: {
            title: `Steep Route Incline (${maxRouteIncline}% vs max ${userMaxSlope}%)`,
            description: `A segment of this route reaches an incline of ${maxRouteIncline}%, exceeding the user's configured threshold of ${userMaxSlope}%.`,
            severity: isSevere ? "critical" : "high",
            impactedDimension: "mobility",
            recommendedAction: "Use an alternative low-gradient corridor or ensure companion assistance on steep sections.",
          },
          summaryNote: `Route incline of ${maxRouteIncline}% exceeds user limit.`,
        };
      }
      return null;
    },
  },

  {
    id: "ROUTE-MOB-003",
    name: "High-Vibration Surface Barrier",
    category: "Route Mobility",
    description: "Detects cobblestones, loose gravel, or rough terrain exceeding safe tolerance for wheeled equipment.",
    priority: 85,
    evaluate(profile, route) {
      const usesWheels =
        profile.mobility.usesWheelchair ||
        profile.mobility.usesMobilityScooter ||
        profile.mobility.usesCrutchesOrWalkingAid;

      if (!usesWheels) return null;

      const dist = route.characteristics.surfaceDistribution;
      const cobblestonePct = (dist["cobblestone"] ?? 0) + (dist["unpaved"] ?? 0);
      const gravelPct = (dist["gravel"] ?? 0) + (dist["ground"] ?? 0);

      if (cobblestonePct >= 15 || gravelPct >= 10) {
        return {
          barrier: {
            title: "Rough Surface: Cobblestones or Loose Gravel Present",
            description: `Approximately ${cobblestonePct + gravelPct}% of this route consists of high-vibration cobblestone, gravel, or unpaved ground, posing tipping and joint strain risks.`,
            severity: "high",
            impactedDimension: "mobility",
            recommendedAction: "Consider rerouting via smooth asphalt roadways or concrete sidewalks.",
          },
          summaryNote: "Route surface barrier: Cobblestones or loose gravel.",
        };
      }
      return null;
    },
  },

  {
    id: "ROUTE-MOB-004",
    name: "Preferred Step-Free Route Barrier",
    category: "Route Mobility",
    description: "Detects stairs when the traveler prefers step-free paths to reduce joint strain.",
    priority: 75,
    evaluate(profile, route) {
      const prefersStepFree = profile.mobility.requiresStepFreeAccess === "preferred";
      if (!prefersStepFree) return null;

      if (route.characteristics.hasKnownSteps || route.characteristics.knownStepsCount > 0) {
        return {
          barrier: {
            title: "Route Contains Steps (Step-Free Access Preferred)",
            description: "Pathway includes steps that will require ascending or descending stairs.",
            severity: "medium",
            impactedDimension: "mobility",
            recommendedAction: "Allow extra travel time or seek level pavement detours.",
          },
          summaryNote: "Preferred step-free route requirement unmet.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category B: Stamina & Distance
  // ==========================================
  {
    id: "ROUTE-STAM-001",
    name: "Route Distance Exceeds Walking Endurance",
    category: "Route Stamina",
    description: "Identifies when total journey distance exceeds continuous walking capacity without resting.",
    priority: 90,
    evaluate(profile, route) {
      const maxDistance = profile.mobility.maxWalkingDistanceMeters;
      if (typeof maxDistance !== "number" || maxDistance <= 0) return null;

      if (route.distanceMeters > maxDistance) {
        return {
          barrier: {
            title: `Route Distance Exceeds Capacity (${route.distanceMeters}m vs max ${maxDistance}m)`,
            description: `The total travel distance of ${route.distanceMeters} meters exceeds the user's safe walking distance limit of ${maxDistance} meters.`,
            severity: "high",
            impactedDimension: "stamina_endurance",
            recommendedAction: "Identify mid-route rest benches or utilize public transit / taxi for segments.",
          },
          summaryNote: "Stamina barrier: Journey distance exceeds limit.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category C: Vision & Wayfinding
  // ==========================================
  {
    id: "ROUTE-VIS-001",
    name: "Tactile Ground Surface Paving Missing on Route",
    category: "Route Vision",
    description: "Detects absent tactile guidance indicators for individuals who require tactile wayfinding.",
    priority: 80,
    evaluate(profile, route) {
      const needsTactile = profile.vision.requiresTactileGroundPaving === "essential";
      if (!needsTactile) return null;

      if (route.characteristics.hasKnownTactilePaving === false) {
        return {
          barrier: {
            title: "Tactile Wayfinding Paving Confirmed Absent",
            description: "Sidewalks and pedestrian street crossings along this route lack tactile ground surface indicators.",
            severity: "high",
            impactedDimension: "vision",
            recommendedAction: "Exercise heightened caution at crossings or travel with a guide.",
          },
          summaryNote: "Vision barrier: Absent tactile paving on route.",
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category D: Uncertainty & Missing Metadata
  // ==========================================
  {
    id: "ROUTE-UNC-001",
    name: "Unknown Surface Material Information Gap",
    category: "Route Uncertainty",
    description: "Enforces the Uncertainty Principle: flags unmeasured surface data when smooth paving is critical.",
    priority: 85,
    evaluate(profile, route) {
      const needsSmooth =
        profile.mobility.usesWheelchair ||
        profile.mobility.requiresStepFreeAccess === "essential" ||
        profile.mobility.maxStepHeightCm !== null;

      if (!needsSmooth) return null;

      const unknownSurface = route.characteristics.unknownSurfacePercent;
      if (unknownSurface > 30) {
        return {
          informationGap: {
            feature: "Sidewalk Surface Quality & Pavement Material",
            dimension: "mobility",
            whyNeeded: `${unknownSurface}% of this route lacks recorded surface tagging in OpenStreetMap; cobblestones or broken paving cannot be ruled out.`,
            recommendedVerification: "Verify surface conditions via street-level imagery or local reconnaissance.",
          },
          summaryNote: `Information gap: ${unknownSurface}% of route has unmeasured surface data.`,
        };
      }
      return null;
    },
  },

  {
    id: "ROUTE-UNC-002",
    name: "Unknown Gradient Slope Information Gap",
    category: "Route Uncertainty",
    description: "Flags missing slope data when maximum incline is an essential requirement.",
    priority: 80,
    evaluate(profile, route) {
      const hasInclineLimit =
        profile.mobility.maxRampSlopePercent !== null ||
        profile.mobility.usesWheelchair;

      if (!hasInclineLimit) return null;

      const unknownIncline = route.characteristics.unknownInclinePercent;
      if (unknownIncline > 50) {
        return {
          informationGap: {
            feature: "Elevation & Gradient Incline Data",
            dimension: "mobility",
            whyNeeded: `${unknownIncline}% of this route lacks high-resolution slope data; potential steep ramps or curb inclines may exist.`,
            recommendedVerification: "Check elevation contour maps or ask local municipal services about street gradients.",
          },
          summaryNote: `Information gap: ${unknownIncline}% of route has unknown incline.`,
        };
      }
      return null;
    },
  },

  // ==========================================
  // Category E: Route Accessibility Strengths
  // ==========================================
  {
    id: "ROUTE-STR-001",
    name: "Verified Smooth Pavement Corridor",
    category: "Route Strengths",
    description: "Identifies routes predominantly composed of smooth asphalt or high-quality concrete.",
    priority: 70,
    evaluate(_profile, route) {
      const dist = route.characteristics.surfaceDistribution;
      const smoothPct = (dist["asphalt"] ?? 0) + (dist["paved"] ?? 0) + (dist["concrete"] ?? 0);

      if (smoothPct >= 75) {
        return {
          strength: {
            title: `Predominantly Smooth Pavement (${smoothPct}%)`,
            description: "The majority of this pedestrian corridor is paved with smooth asphalt or concrete, minimizing wheeled vibration.",
            dimension: "mobility",
          },
          summaryNote: "Strength: High proportion of smooth pavement.",
        };
      }
      return null;
    },
  },

  {
    id: "ROUTE-STR-002",
    name: "Level Grade Terrain",
    category: "Route Strengths",
    description: "Identifies routes with gentle, level slopes (<=3%) minimizing physical exertion.",
    priority: 65,
    evaluate(_profile, route) {
      if (route.characteristics.maxInclinePercent <= 3 && route.characteristics.unknownInclinePercent <= 50) {
        return {
          strength: {
            title: "Level Ground: Incline Grade <= 3%",
            description: "Continuous gentle slope with negligible elevation changes, ideal for manual wheelchairs and limited walking endurance.",
            dimension: "mobility",
          },
          summaryNote: "Strength: Flat, level terrain.",
        };
      }
      return null;
    },
  },

  {
    id: "ROUTE-STR-003",
    name: "Continuous Step-Free Pedestrian Corridor",
    category: "Route Strengths",
    description: "Recognizes routes verified to be completely devoid of stairs or step barriers.",
    priority: 60,
    evaluate(_profile, route) {
      if (!route.characteristics.hasKnownSteps && route.characteristics.knownStepsCount === 0) {
        return {
          strength: {
            title: "Zero Known Stairs or Curb Drops",
            description: "Routing geometry follows dedicated pedestrian passages without recorded step barriers.",
            dimension: "mobility",
          },
          summaryNote: "Strength: Step-free pathway.",
        };
      }
      return null;
    },
  },
];
