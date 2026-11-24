import type { GeoCoordinates } from "@/types/common";
import { getHaversineDistanceMeters, findNearestPointOnRoute } from "@/features/routing/engine/navigation-tracker";
import type { CommunityReport, HazardProximityAlert } from "./types";

/**
 * Checks if an obstacle is ahead in the direction of travel and within proximity.
 * Filters out:
 * - Resolved or rejected reports
 * - Obstacles behind the user
 * - Obstacles on distant/unrelated streets (>35m perpendicular to route corridor)
 * - Already dismissed reports
 * - Reports alerted recently (within cooldown window)
 */
export function checkHazardProximity(
  userPos: GeoCoordinates,
  reports: readonly CommunityReport[],
  alertRadiusMeters = 50,
  recentAlertTimestamps: Record<string, number> = {},
  cooldownMs = 45000,
  routeCoordinates?: readonly GeoCoordinates[],
  travelHeading?: number | null,
  dismissedReportIds?: Set<string>
): HazardProximityAlert | null {
  const activeReports = reports.filter((r) => {
    if (r.status === "resolved" || r.severity === "resolved") return false;
    if (r.moderationStatus === "resolved" || r.moderationStatus === "rejected") return false;
    if (dismissedReportIds && dismissedReportIds.has(r.id)) return false;
    return true;
  });

  const now = Date.now();
  let closestAlert: HazardProximityAlert | null = null;
  let minDistance = Infinity;

  for (const report of activeReports) {
    const straightDist = getHaversineDistanceMeters(userPos, report.coordinates);
    if (straightDist > alertRadiusMeters) continue;

    // Check cooldown
    const lastAlerted = recentAlertTimestamps[report.id] ?? 0;
    if (now - lastAlerted <= cooldownMs) continue;

    // If an active route is provided, evaluate directional alignment and route corridor proximity
    if (routeCoordinates && routeCoordinates.length >= 2) {
      const nearest = findNearestPointOnRoute(userPos, routeCoordinates);
      const nextIndex = Math.min(nearest.segmentIndex + 1, routeCoordinates.length - 1);
      const nextWaypoint = routeCoordinates[nextIndex];

      if (nextWaypoint) {
        // Vector along travel path
        const travelDx = nextWaypoint.longitude - userPos.longitude;
        const travelDy = nextWaypoint.latitude - userPos.latitude;

        // Vector to hazard
        const hazardDx = report.coordinates.longitude - userPos.longitude;
        const hazardDy = report.coordinates.latitude - userPos.latitude;

        const travelLen = Math.hypot(travelDx, travelDy);
        const hazardLen = Math.hypot(hazardDx, hazardDy);

        if (travelLen > 0.00001 && hazardLen > 0.00001) {
          const dot = (travelDx * hazardDx + travelDy * hazardDy) / (travelLen * hazardLen);

          // If dot < 0.2, the hazard is behind the user or perpendicular (angle > 78 degrees)
          if (dot < 0.2) {
            continue; // Hazard is behind the user, suppress "ahead" alert
          }
        }
      }

      // Check perpendicular distance of the hazard from the planned route corridor
      const hazardOnRoute = findNearestPointOnRoute(report.coordinates, routeCoordinates);
      if (hazardOnRoute.distanceMeters > 35) {
        continue; // Hazard is on a parallel/unrelated street outside corridor
      }
    } else if (typeof travelHeading === "number" && !isNaN(travelHeading)) {
      // If heading is available without route geometry
      const dLat = report.coordinates.latitude - userPos.latitude;
      const dLon = report.coordinates.longitude - userPos.longitude;
      const bearingToHazard = (Math.atan2(dLon, dLat) * 180) / Math.PI;
      const normalizedBearing = (bearingToHazard + 360) % 360;

      let angleDiff = Math.abs(travelHeading - normalizedBearing);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      // If angle difference > 80 degrees, the hazard is not in front of the traveler
      if (angleDiff > 80) {
        continue;
      }
    }

    if (straightDist < minDistance) {
      minDistance = straightDist;
      closestAlert = {
        report,
        distanceMeters: Math.round(straightDist),
        isDirectlyAhead: true,
        message: `${report.title} (~${Math.round(straightDist)}m ahead). ${report.routeImpact}`,
        timestamp: now,
      };
    }
  }

  return closestAlert;
}
