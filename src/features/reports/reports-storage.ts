import type { CommunityReport } from "./types";

export const REPORTS_STORAGE_KEY = "accessmate_community_reports";

export const INITIAL_COMMUNITY_REPORTS: readonly CommunityReport[] = [
  {
    id: "rep-001",
    title: "Elevator Outage — Platform 2 North Concourse",
    location: "Berlin Central Station, North Entry",
    coordinates: {
      latitude: 52.5255,
      longitude: 13.3695,
    },
    category: "elevator",
    severity: "critical",
    createdAt: "2026-11-24T14:45:00.000Z",
    timeAgo: "14 mins ago",
    confirmationCount: 4,
    details:
      "Freight & passenger lift out of service for scheduled motor replacement. Step-free access between street and subway level currently blocked on North side.",
    routeImpact: "Use South concourse elevator (120m detour) for level platform access.",
    status: "active",
    reportedBy: "Peer Mobility Advocate",
  },
  {
    id: "rep-002",
    title: "Sidewalk Scaffolding & Broken Curb Ramp",
    location: "Corner of Moltkebrücke & Willy-Brandt-Straße",
    coordinates: {
      latitude: 52.5222,
      longitude: 13.3708,
    },
    category: "construction",
    severity: "warning",
    createdAt: "2026-11-24T14:00:00.000Z",
    timeAgo: "1 hour ago",
    confirmationCount: 3,
    details:
      "Facade restoration scaffolding narrows pedestrian sidewalk to 70cm. Temporary wooden ramp exceeds 10% incline.",
    routeImpact: "Cross at Moltkebrücke pedestrian crossing to avoid narrow corridor.",
    status: "active",
    reportedBy: "Local Commuter",
  },
  {
    id: "rep-003",
    title: "Deep Pavement Ruts & Broken Stone Surface",
    location: "Spreebogenpark Promenade South",
    coordinates: {
      latitude: 52.5208,
      longitude: 13.3725,
    },
    category: "surface",
    severity: "warning",
    createdAt: "2026-11-24T13:15:00.000Z",
    timeAgo: "2 hours ago",
    confirmationCount: 2,
    details:
      "Cobblestone dislocation after heavy transit vehicle delivery. Severe rolling resistance for manual wheelchairs.",
    routeImpact: "Bypass using paved asphalt path 30m east through park promenade.",
    status: "active",
    reportedBy: "Wheelchair Marathoner",
  },
  {
    id: "rep-004",
    title: "Automatic Door Opener Restored",
    location: "City Public Library, West Ramp Entry",
    coordinates: {
      latitude: 52.5085,
      longitude: 13.3698,
    },
    category: "restroom",
    severity: "resolved",
    createdAt: "2026-11-24T12:00:00.000Z",
    timeAgo: "3 hours ago",
    confirmationCount: 6,
    details:
      "The push-button automatic actuator on the West ground-floor accessible entrance is now fully operational.",
    routeImpact: "West ramp entrance is 100% accessible with no staff assistance required.",
    status: "resolved",
    reportedBy: "Library Facility Ops",
  },
];

function notifySubscribers(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("accessmate:reports-updated"));
  }
}

export const reportsRepository = {
  getReports(): CommunityReport[] {
    if (typeof window === "undefined") {
      return [...INITIAL_COMMUNITY_REPORTS];
    }
    try {
      const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_REPORTS));
        return [...INITIAL_COMMUNITY_REPORTS];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_REPORTS));
        return [...INITIAL_COMMUNITY_REPORTS];
      }
      return parsed;
    } catch {
      return [...INITIAL_COMMUNITY_REPORTS];
    }
  },

  saveReport(report: CommunityReport): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getReports();
      const updated = [report, ...current.filter((r) => r.id !== report.id)];
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch (err) {
      console.warn("Failed to save community report to localStorage", err);
    }
  },

  confirmReport(reportId: string): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getReports();
      const updated = current.map((r) =>
        r.id === reportId ? { ...r, confirmationCount: r.confirmationCount + 1 } : r
      );
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch (err) {
      console.warn("Failed to confirm report", err);
    }
  },

  resolveReport(reportId: string): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getReports();
      const updated = current.map((r) =>
        r.id === reportId ? { ...r, status: "resolved" as const, severity: "resolved" as const } : r
      );
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch (err) {
      console.warn("Failed to resolve report", err);
    }
  },

  resetDefaults(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_REPORTS));
      notifySubscribers();
    } catch (err) {
      console.warn("Failed to reset reports", err);
    }
  },
};
