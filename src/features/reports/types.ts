import type { GeoCoordinates } from "@/types/common";

export type ReportCategory =
  | "elevator"
  | "construction"
  | "surface"
  | "curb_ramp"
  | "restroom"
  | "other";

export type ReportSeverity = "critical" | "warning" | "info" | "resolved";

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
  readonly details: string;
  readonly routeImpact: string;
  readonly status: "active" | "resolved";
  readonly reportedBy?: string;
}
