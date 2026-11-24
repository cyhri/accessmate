/**
 * Real-Time GPS Spatial Tracker, Route Snapping & Off-Route Detection
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import type { GeoCoordinates } from "@/types/common";

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export function getHaversineDistanceMeters(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export interface NearestRoutePointResult {
  readonly point: GeoCoordinates;
  readonly distanceMeters: number;
  readonly segmentIndex: number;
  readonly fractionAlongSegment: number;
  readonly isOffRoute: boolean;
}

/**
 * Normalizes input coordinate to { latitude, longitude }
 */
function normalizeCoord(c: [number, number] | GeoCoordinates): GeoCoordinates {
  if (Array.isArray(c)) {
    return { latitude: c[0], longitude: c[1] };
  }
  return c;
}

/**
 * Calculates the perpendicular projection of a point onto a line segment.
 */
function projectPointOnSegment(
  p: { latitude: number; longitude: number },
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): { point: GeoCoordinates; fraction: number; distanceMeters: number } {
  const abDist = getHaversineDistanceMeters(a, b);
  if (abDist < 0.1) {
    return {
      point: { latitude: a.latitude, longitude: a.longitude },
      fraction: 0,
      distanceMeters: getHaversineDistanceMeters(p, a),
    };
  }

  // Linear projection in local planar coordinates
  const dx = (b.longitude - a.longitude) * Math.cos(((a.latitude + b.latitude) * Math.PI) / 360);
  const dy = b.latitude - a.latitude;
  const px = (p.longitude - a.longitude) * Math.cos(((a.latitude + b.latitude) * Math.PI) / 360);
  const py = p.latitude - a.latitude;

  const dot = px * dx + py * dy;
  const lenSq = dx * dx + dy * dy;
  const fraction = Math.max(0, Math.min(1, dot / (lenSq || 1)));

  const projectedLat = a.latitude + fraction * (b.latitude - a.latitude);
  const projectedLng = a.longitude + fraction * (b.longitude - a.longitude);
  const projPoint = { latitude: projectedLat, longitude: projectedLng };

  return {
    point: projPoint,
    fraction,
    distanceMeters: getHaversineDistanceMeters(p, projPoint),
  };
}

/**
 * Finds the nearest point on the route LineString, distance from route, and progress.
 * Supports coordinates as array of [latitude, longitude] or GeoCoordinates objects.
 */
export function findNearestPointOnRoute(
  userPos: { latitude: number; longitude: number },
  routeCoordinates: readonly ([number, number] | GeoCoordinates)[],
  offRouteThresholdMeters = 30
): NearestRoutePointResult {
  if (routeCoordinates.length === 0) {
    return {
      point: { latitude: userPos.latitude, longitude: userPos.longitude },
      distanceMeters: 0,
      segmentIndex: 0,
      fractionAlongSegment: 0,
      isOffRoute: false,
    };
  }

  if (routeCoordinates.length === 1) {
    const raw0 = routeCoordinates[0];
    if (!raw0) {
      return {
        point: { latitude: userPos.latitude, longitude: userPos.longitude },
        distanceMeters: 0,
        segmentIndex: 0,
        fractionAlongSegment: 0,
        isOffRoute: false,
      };
    }
    const singleCoord = normalizeCoord(raw0);
    const dist = getHaversineDistanceMeters(userPos, singleCoord);
    return {
      point: singleCoord,
      distanceMeters: dist,
      segmentIndex: 0,
      fractionAlongSegment: 1,
      isOffRoute: dist > offRouteThresholdMeters,
    };
  }

  const rawFirst = routeCoordinates[0];
  if (!rawFirst) {
    return {
      point: { latitude: userPos.latitude, longitude: userPos.longitude },
      distanceMeters: 0,
      segmentIndex: 0,
      fractionAlongSegment: 0,
      isOffRoute: false,
    };
  }

  const firstCoord = normalizeCoord(rawFirst);
  let minDistance = Infinity;
  let bestPoint: GeoCoordinates = firstCoord;
  let bestSegmentIndex = 0;
  let bestFraction = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const rawA = routeCoordinates[i];
    const rawB = routeCoordinates[i + 1];
    if (!rawA || !rawB) continue;

    const ptA = normalizeCoord(rawA);
    const ptB = normalizeCoord(rawB);

    const projection = projectPointOnSegment(userPos, ptA, ptB);
    if (projection.distanceMeters < minDistance) {
      minDistance = projection.distanceMeters;
      bestPoint = projection.point;
      bestSegmentIndex = i;
      bestFraction = projection.fraction;
    }
  }

  return {
    point: bestPoint,
    distanceMeters: minDistance,
    segmentIndex: bestSegmentIndex,
    fractionAlongSegment: bestFraction,
    isOffRoute: minDistance > offRouteThresholdMeters,
  };
}

/**
 * Calculates remaining walking distance along the actual route LineString geometry.
 */
export function calculateRemainingRouteDistanceMeters(
  routeCoordinates: readonly ([number, number] | GeoCoordinates)[],
  nearestResult: NearestRoutePointResult
): number {
  if (routeCoordinates.length < 2) return 0;

  let remaining = 0;

  // Partial distance on the current segment from projected point to segment end
  const rawNext = routeCoordinates[nearestResult.segmentIndex + 1];
  if (rawNext) {
    const currentEnd = normalizeCoord(rawNext);
    remaining += getHaversineDistanceMeters(nearestResult.point, currentEnd);
  }

  // Sum all subsequent segments
  for (let i = nearestResult.segmentIndex + 1; i < routeCoordinates.length - 1; i++) {
    const raw1 = routeCoordinates[i];
    const raw2 = routeCoordinates[i + 1];
    if (!raw1 || !raw2) continue;

    const pt1 = normalizeCoord(raw1);
    const pt2 = normalizeCoord(raw2);
    remaining += getHaversineDistanceMeters(pt1, pt2);
  }

  return Math.round(remaining);
}

/**
 * Estimate travel time in minutes based on remaining distance and accessible travel speed.
 * Default accessible pedestrian / wheelchair speed is approx 1.1 m/s (~4.0 km/h).
 */
export function calculateEstimatedDurationMinutes(
  distanceMeters: number,
  speedMetersPerSecond = 1.1
): number {
  if (distanceMeters <= 0) return 0;
  return Math.max(1, Math.ceil(distanceMeters / (speedMetersPerSecond * 60)));
}
