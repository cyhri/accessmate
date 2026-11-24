import type { GeoCoordinates } from "@/types/common";

export type ReportCategory =
  | "elevator"
  | "construction"
  | "surface"
  | "curb_ramp"
  | "restroom"
  | "other";

export type ReportSeverity = "critical" | "warning" | "info" | "resolved";

export type ReportModerationStatus =
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected"
  | "resolved";

export interface ModerationLogEntry {
  readonly id: string;
  readonly reportId: string;
  readonly moderatorId: string;
  readonly moderatorName: string;
  readonly previousStatus: ReportModerationStatus;
  readonly newStatus: ReportModerationStatus;
  readonly note?: string;
  readonly createdAt: string;
}

export interface CommunityReport {
  readonly id: string;
  readonly title: string;
  readonly location: string;
  readonly coordinates: GeoCoordinates;
  readonly category: ReportCategory;
  readonly severity: ReportSeverity;
  readonly createdAt: string;
  readonly timeAgo: string;
  readonly confirmationCount: number;
  readonly confirmedByUserIds?: readonly string[];
  readonly details: string;
  readonly routeImpact: string;
  /**
   * status maintains compatibility with "active" | "resolved",
   * and moderationStatus provides the full administrative 5-stage lifecycle.
   */
  readonly status: "active" | "resolved";
  readonly moderationStatus: ReportModerationStatus;
  readonly reportedBy?: string;
  readonly reportedByUserId?: string;
  readonly moderationNotes?: string;
  readonly moderatedBy?: string;
  readonly moderatedAt?: string;
}

export interface HazardProximityAlert {
  readonly report: CommunityReport;
  readonly distanceMeters: number;
  readonly isDirectlyAhead?: boolean;
  readonly message: string;
  readonly timestamp: number;
}
