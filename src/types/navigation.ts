/**
 * Route & Spatial Navigation Types (Planned Phase 5)
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { GeoCoordinates } from "./common";

export type SurfaceType =
  | "smooth_pavement"
  | "asphalt"
  | "cobblestone"
  | "gravel"
  | "unpaved_dirt"
  | "unknown";

export interface PathSegment {
  readonly segmentId: string;
  readonly startCoordinates: GeoCoordinates;
  readonly endCoordinates: GeoCoordinates;
  readonly lengthMeters: number;
  readonly inclinePercentage: number;
  readonly surfaceType: SurfaceType;
  readonly hasCurbCuts: boolean;
  readonly hasLighting: boolean;
}

export interface RoutePlan {
  readonly routeId: string;
  readonly origin: GeoCoordinates;
  readonly destination: GeoCoordinates;
  readonly totalDistanceMeters: number;
  readonly estimatedDurationMinutes: number;
  readonly maxInclinePercent: number;
  readonly segments: readonly PathSegment[];
  readonly detectedBarriersCount: number;
}
