/**
 * Routing & Spatial Decision-Support Type Contracts
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System (Phase 5)
 */

import type { GeoCoordinates } from "../../types/common.ts";
import type { AssessmentOutcome } from "../../constants/index.ts";
import type {
  EvaluatedBarrier,
  EvaluatedStrength,
  InformationGap,
  EvidenceConflict,
  ExplanationTraceItem,
  RecommendedActionItem,
} from "../expert-system/types.ts";

export type { GeoCoordinates };

/**
 * Standard Geocoding Suggestion / Result from HeiGIT Pelias
 */
export interface GeocodingResult {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly coordinates: GeoCoordinates;
  readonly locality?: string;
  readonly country?: string;
  readonly postalCode?: string;
  readonly confidence?: number;
}

/**
 * OpenRouteService Wheelchair Profile Routing Parameters
 */
export interface ORSWheelchairRestrictions {
  readonly maximum_incline?: number; // Incline tolerance percentage (e.g. 6%)
  readonly maximum_sloped_kerb?: number; // Max curb drop in meters (e.g. 0.06m)
  readonly surface_type?: string; // e.g. "asphalt", "concrete"
  readonly smoothness_type?: string; // e.g. "good", "intermediate"
  readonly track_type?: string;
}

export interface ORSRoutingOptions {
  readonly profile_params?: {
    readonly restrictions?: ORSWheelchairRestrictions;
  };
  readonly avoid_features?: readonly string[]; // ["steps"]
}

/**
 * Step-by-Step Navigation Instruction
 */
export interface RouteStepInstruction {
  readonly instruction: string;
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  readonly name: string;
  readonly type: number;
  readonly wayPoints: readonly [number, number]; // [startIndex, endIndex] in coordinates array
}

/**
 * Physical Environmental Characteristics of the Route
 */
export interface RouteCharacteristics {
  readonly totalDistanceMeters: number;
  readonly estimatedDurationMinutes: number;
  readonly maxInclinePercent: number;
  readonly steepSegmentsPercent: number;
  readonly surfaceDistribution: Readonly<Record<string, number>>; // e.g. { "asphalt": 60, "cobblestone": 20, "unknown": 20 }
  readonly unknownSurfacePercent: number;
  readonly unknownInclinePercent: number;
  readonly hasKnownSteps: boolean;
  readonly knownStepsCount: number;
  readonly wayTypes: readonly string[];
  readonly hasKnownTactilePaving?: boolean;
}

/**
 * Personalized Accessibility Assessment Result for a Route
 */
export interface RouteAssessmentResult {
  readonly routeId: string;
  readonly profileId: string;
  readonly profileName: string;
  readonly overallOutcome: AssessmentOutcome;
  readonly outcomeTitle: string;
  readonly outcomeDescription: string;
  readonly essentialRequirements: {
    readonly total: number;
    readonly satisfiedCount: number;
    readonly unmetCount: number;
    readonly unknownCount: number;
  };
  readonly barriers: readonly EvaluatedBarrier[];
  readonly strengths: readonly EvaluatedStrength[];
  readonly informationGaps: readonly InformationGap[];
  readonly evidenceConflicts: readonly EvidenceConflict[];
  readonly explanationTraces: readonly ExplanationTraceItem[];
  readonly recommendations: readonly RecommendedActionItem[];
  readonly evaluatedAt: string;
}

/**
 * Full Evaluated Route Plan with geometry and metadata
 */
export interface FullRoutePlan {
  readonly id: string;
  readonly name: string;
  readonly origin: GeoCoordinates;
  readonly destination: GeoCoordinates;
  readonly originLabel: string;
  readonly destinationLabel: string;
  readonly coordinates: readonly [number, number][]; // [lat, lon] tuples for Leaflet
  readonly distanceMeters: number;
  readonly durationMinutes: number;
  readonly elevationGainMeters?: number;
  readonly elevationLossMeters?: number;
  readonly steps: readonly RouteStepInstruction[];
  readonly characteristics: RouteCharacteristics;
  readonly assessment?: RouteAssessmentResult;
  readonly isAlternative?: boolean;
  readonly dataSource: "live_ors" | "demo_network";
  readonly warningNotice?: string;
}

/**
 * Raw ORS GeoJSON Response Types
 */
export interface ORSSummary {
  readonly distance: number;
  readonly duration: number;
}

export interface ORSStep {
  readonly distance: number;
  readonly duration: number;
  readonly type: number;
  readonly instruction: string;
  readonly name: string;
  readonly way_points: [number, number];
}

export interface ORSSegment {
  readonly distance: number;
  readonly duration: number;
  readonly steps: readonly ORSStep[];
}

export interface ORSExtraValues {
  readonly values: readonly (readonly [number, number, number | string])[]; // [startIndex, endIndex, value]
  readonly summary?: readonly {
    readonly value: number | string;
    readonly distance: number;
    readonly amount: number;
  }[];
}

export interface ORSExtras {
  readonly steepness?: ORSExtraValues;
  readonly surface?: ORSExtraValues;
  readonly waytype?: ORSExtraValues;
  readonly waycategory?: ORSExtraValues;
  readonly suitability?: ORSExtraValues;
  readonly osmid?: ORSExtraValues;
}

export interface ORSRouteProperties {
  readonly summary: ORSSummary;
  readonly segments: readonly ORSSegment[];
  readonly extras?: ORSExtras;
  readonly ascent?: number;
  readonly descent?: number;
  readonly warnings?: readonly {
    readonly code: number;
    readonly message: string;
  }[];
}

export interface ORSGeoJSONFeature {
  readonly type: "Feature";
  readonly geometry: {
    readonly type: "LineString";
    readonly coordinates: readonly (readonly [number, number, number?])[]; // [lon, lat, alt?]
  };
  readonly properties: ORSRouteProperties;
}

export interface ORSGeoJSONResponse {
  readonly type: "FeatureCollection";
  readonly features: readonly ORSGeoJSONFeature[];
  readonly bbox?: readonly number[];
  readonly metadata?: {
    readonly attribution: string;
    readonly service: string;
    readonly timestamp: number;
    readonly query: Record<string, unknown>;
  };
}
