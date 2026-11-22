/**
 * OpenRouteService Client & Response Parser Utilities
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System (Phase 5)
 */

import type { GeoCoordinates } from "../../types/common.ts";
import type { UserAccessibilityProfile } from "../../types/profile.ts";
import type {
  ORSWheelchairRestrictions,
  ORSRoutingOptions,
  ORSGeoJSONResponse,
  FullRoutePlan,
  RouteStepInstruction,
  RouteCharacteristics,
} from "./types.ts";

/**
 * Coordinate Conversion Utilities
 * Leaflet: [latitude, longitude]
 * ORS GeoJSON: [longitude, latitude]
 */
export function leafletToORS(coords: readonly [number, number]): [number, number] {
  return [coords[1], coords[0]];
}

export function orsToLeaflet(coords: readonly [number, number, number?]): [number, number] {
  return [coords[1], coords[0]];
}

export function geoCoordsToORS(coord: GeoCoordinates): [number, number] {
  return [coord.longitude, coord.latitude];
}

export function orsToGeoCoords(coords: readonly [number, number, number?]): GeoCoordinates {
  return {
    latitude: coords[1],
    longitude: coords[0],
    altitudeMeters: coords[2],
  };
}

/**
 * Maps User Accessibility Profile to standard ORS Wheelchair Routing Restrictions
 * Does NOT invent arbitrary values; uses documented defaults when unspecified.
 */
export function buildORSWheelchairRestrictions(
  profile: UserAccessibilityProfile
): { options: ORSRoutingOptions } {
  const restrictions: Record<string, string | number> = {};
  const avoidFeatures: string[] = [];

  // Incline: map maxRampSlopePercent (e.g. 6% or 8%)
  if (typeof profile.mobility.maxRampSlopePercent === "number" && profile.mobility.maxRampSlopePercent > 0) {
    // ORS supports maximum_incline percentage (clamped between 3% and 15%)
    const clampedIncline = Math.min(15, Math.max(3, Math.round(profile.mobility.maxRampSlopePercent)));
    restrictions.maximum_incline = clampedIncline;
  } else if (profile.mobility.usesWheelchair) {
    restrictions.maximum_incline = 6; // Standard 6% maximum for independent wheelchair mobility
  }

  // Kerb height: map maxStepHeightCm to meters (e.g. 3cm -> 0.03m, 6cm -> 0.06m)
  if (typeof profile.mobility.maxStepHeightCm === "number" && profile.mobility.maxStepHeightCm >= 0) {
    const kerbMeters = Math.max(0.01, Math.min(0.15, profile.mobility.maxStepHeightCm / 100));
    restrictions.maximum_sloped_kerb = Number(kerbMeters.toFixed(2));
  } else if (profile.mobility.usesWheelchair) {
    restrictions.maximum_sloped_kerb = 0.06; // Default 6cm drop
  }

  // Avoid steps if user has essential step-free requirement or difficulty with stairs
  if (
    profile.mobility.requiresStepFreeAccess === "essential" ||
    profile.mobility.difficultyClimbingStairs ||
    profile.mobility.usesWheelchair ||
    profile.mobility.usesMobilityScooter
  ) {
    avoidFeatures.push("steps");
  }

  const options: ORSRoutingOptions = {
    profile_params: {
      restrictions: Object.keys(restrictions).length > 0 ? (restrictions as ORSWheelchairRestrictions) : undefined,
    },
    avoid_features: avoidFeatures.length > 0 ? avoidFeatures : undefined,
  };

  return { options };
}

/**
 * Decodes ORS Steepness index to estimated slope percentage
 * ORS steepness codes:
 * -5: <-16%, -4: -10 to -15%, -3: -7 to -9%, -2: -4 to -6%, -1: -1 to -3%, 0: 0%
 *  1: 1 to 3%, 2: 4 to 6%, 3: 7 to 9%, 4: 10 to 15%, 5: >16%
 */
export function decodeORSSteepnessCode(code: number): number {
  const abs = Math.abs(code);
  switch (abs) {
    case 1:
      return 3;
    case 2:
      return 6;
    case 3:
      return 9;
    case 4:
      return 15;
    case 5:
      return 18;
    default:
      return 0;
  }
}

/**
 * Decodes ORS Surface index or name to normalized surface type string
 */
export function decodeORSSurfaceValue(val: number | string): string {
  if (typeof val === "string") {
    return val.toLowerCase();
  }
  // Common numeric surface codes in ORS
  switch (val) {
    case 1:
      return "paved";
    case 2:
      return "unpaved";
    case 3:
      return "asphalt";
    case 4:
      return "concrete";
    case 5:
      return "cobblestone";
    case 6:
      return "metal";
    case 7:
      return "wood";
    case 8:
      return "compacted";
    case 9:
      return "gravel";
    case 10:
      return "ground";
    default:
      return "unknown";
  }
}

/**
 * Parses an ORS GeoJSON response into a rich FullRoutePlan entity
 */
export function parseORSGeoJSONResponse(
  geojson: ORSGeoJSONResponse,
  originLabel: string,
  destinationLabel: string,
  featureIndex = 0,
  dataSource: "live_ors" | "demo_network" = "live_ors"
): FullRoutePlan {
  if (!geojson.features || geojson.features.length <= featureIndex) {
    throw new Error("No route features found in routing response.");
  }

  const feature = geojson.features[featureIndex];
  if (!feature || !feature.geometry || !feature.geometry.coordinates) {
    throw new Error("Invalid or empty route geometry in response.");
  }

  const rawCoords = feature.geometry.coordinates;
  // Convert [lon, lat, alt?] -> [lat, lon] tuples for Leaflet
  const leafletCoords: [number, number][] = rawCoords.map((c) => [c[1], c[0]]);

  const firstCoord = leafletCoords[0] ?? [0, 0];
  const lastCoord = leafletCoords[leafletCoords.length - 1] ?? [0, 0];

  const origin: GeoCoordinates = { latitude: firstCoord[0], longitude: firstCoord[1] };
  const destination: GeoCoordinates = { latitude: lastCoord[0], longitude: lastCoord[1] };

  const summary = feature.properties.summary ?? { distance: 0, duration: 0 };
  const distanceMeters = Math.round(summary.distance);
  const durationMinutes = Math.max(1, Math.round(summary.duration / 60));

  // Extract Turn-by-Turn Steps
  const steps: RouteStepInstruction[] = [];
  const segments = feature.properties.segments ?? [];
  let hasKnownSteps = false;
  let knownStepsCount = 0;

  for (const seg of segments) {
    if (seg.steps) {
      for (const st of seg.steps) {
        steps.push({
          instruction: st.instruction,
          distanceMeters: Math.round(st.distance),
          durationSeconds: Math.round(st.duration),
          name: st.name || "Pedestrian Pathway",
          type: st.type,
          wayPoints: st.way_points,
        });

        // Check if instruction mentions stairs or steps
        const lower = st.instruction.toLowerCase();
        if (lower.includes("stairs") || lower.includes("steps") || lower.includes("staircase")) {
          hasKnownSteps = true;
          knownStepsCount++;
        }
      }
    }
  }

  // Parse Extras: Surface, Steepness, WayType
  const extras = feature.properties.extras;
  let maxInclinePercent = 0;
  let steepSegmentPoints = 0;
  let totalInclinePoints = 0;
  let unknownInclinePoints = 0;

  if (extras?.steepness?.values) {
    for (const item of extras.steepness.values) {
      const startIdx = item[0] as number;
      const endIdx = item[1] as number;
      const code = item[2] as number;
      const points = Math.max(1, endIdx - startIdx);
      totalInclinePoints += points;

      if (code === 0) {
        // level or unknown
      } else {
        const incline = decodeORSSteepnessCode(code);
        if (incline > maxInclinePercent) {
          maxInclinePercent = incline;
        }
        if (incline >= 8) {
          steepSegmentPoints += points;
        }
      }
    }
  } else {
    unknownInclinePoints = leafletCoords.length;
  }

  const surfaceCounts: Record<string, number> = {};
  let totalSurfacePoints = 0;

  if (extras?.surface?.values) {
    for (const item of extras.surface.values) {
      const startIdx = item[0] as number;
      const endIdx = item[1] as number;
      const val = item[2];
      const count = Math.max(1, endIdx - startIdx);
      totalSurfacePoints += count;

      const surfaceType = decodeORSSurfaceValue(val);
      surfaceCounts[surfaceType] = (surfaceCounts[surfaceType] ?? 0) + count;
    }
  }

  // Calculate percentages
  const surfaceDistribution: Record<string, number> = {};
  if (totalSurfacePoints > 0) {
    for (const [surf, count] of Object.entries(surfaceCounts)) {
      surfaceDistribution[surf] = Math.round((count / totalSurfacePoints) * 100);
    }
  } else {
    surfaceDistribution["unknown"] = 100;
  }

  const unknownSurfacePercent = surfaceDistribution["unknown"] ?? (totalSurfacePoints === 0 ? 100 : 0);
  const unknownInclinePercent = totalInclinePoints > 0
    ? Math.round((unknownInclinePoints / totalInclinePoints) * 100)
    : 100;

  const steepSegmentsPercent = totalInclinePoints > 0
    ? Math.round((steepSegmentPoints / totalInclinePoints) * 100)
    : 0;

  // Extract Way Types
  const wayTypesList: string[] = [];
  if (extras?.waytype?.summary) {
    for (const sum of extras.waytype.summary) {
      wayTypesList.push(String(sum.value));
    }
  }

  const characteristics: RouteCharacteristics = {
    totalDistanceMeters: distanceMeters,
    estimatedDurationMinutes: durationMinutes,
    maxInclinePercent,
    steepSegmentsPercent,
    surfaceDistribution,
    unknownSurfacePercent,
    unknownInclinePercent,
    hasKnownSteps,
    knownStepsCount,
    wayTypes: wayTypesList,
  };

  const isAlternative = featureIndex > 0;
  const planId = `route-${Date.now()}-${featureIndex}`;

  return {
    id: planId,
    name: isAlternative ? `Alternative Route #${featureIndex}` : "Primary Wheelchair Accessible Route",
    origin,
    destination,
    originLabel,
    destinationLabel,
    coordinates: leafletCoords,
    distanceMeters,
    durationMinutes,
    elevationGainMeters: feature.properties.ascent,
    elevationLossMeters: feature.properties.descent,
    steps,
    characteristics,
    isAlternative,
    dataSource,
  };
}
