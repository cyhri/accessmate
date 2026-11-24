import type { GeoCoordinates } from "@/types/common";
import { getHaversineDistanceMeters } from "@/features/routing/engine/navigation-tracker";
import type { CommunityReport } from "./types";

export interface HazardProximityAlert {
  readonly report: CommunityReport;
  readonly distanceMeters: number;
  readonly message: string;
  readonly timestamp: number;
}

/**
 * Checks if the user is within proximity of any active community-reported hazard.
 * Filters out resolved barriers and enforces a per-hazard cooldown to avoid alert spam.
 */
export function checkHazardProximity(
  userPos: GeoCoordinates,
  reports: readonly CommunityReport[],
  alertRadiusMeters = 50,
  recentAlertTimestamps: Record<string, number> = {},
  cooldownMs = 45000
): HazardProximityAlert | null {
  const activeReports = reports.filter((r) => r.status === "active" && r.severity !== "resolved");
  const now = Date.now();

  let closestAlert: HazardProximityAlert | null = null;
  let minDistance = Infinity;

  for (const report of activeReports) {
    const dist = getHaversineDistanceMeters(userPos, report.coordinates);

    if (dist <= alertRadiusMeters && dist < minDistance) {
      const lastAlerted = recentAlertTimestamps[report.id] ?? 0;
      if (now - lastAlerted > cooldownMs) {
        minDistance = dist;
        closestAlert = {
          report,
          distanceMeters: Math.round(dist),
          message: `${report.title} (~${Math.round(dist)}m ahead). ${report.routeImpact}`,
          timestamp: now,
        };
      }
    }
  }

  return closestAlert;
}
