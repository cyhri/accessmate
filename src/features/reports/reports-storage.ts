import type { CommunityReport, ModerationLogEntry, ReportModerationStatus } from "./types";
import { supabase } from "@/lib/supabase/client";

export const REPORTS_STORAGE_KEY = "accessmate_community_reports";
export const MODERATION_LOGS_KEY = "accessmate_moderation_logs";

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
    confirmedByUserIds: ["usr-admin-01", "usr-user-01", "usr-user-02"],
    details:
      "Freight & passenger lift out of service for scheduled motor replacement. Step-free access between street and subway level currently blocked on North side.",
    routeImpact: "Use South concourse elevator (120m detour) for level platform access.",
    status: "active",
    moderationStatus: "verified",
    reportedBy: "Peer Mobility Advocate",
    reportedByUserId: "usr-user-01",
    moderationNotes: "Verified by transit authority dispatch.",
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
    confirmedByUserIds: ["usr-user-01", "usr-user-02"],
    details:
      "Facade restoration scaffolding narrows pedestrian sidewalk to 70cm. Temporary wooden ramp exceeds 10% incline.",
    routeImpact: "Cross at Moltkebrücke pedestrian crossing to avoid narrow corridor.",
    status: "active",
    moderationStatus: "under_review",
    reportedBy: "Local Commuter",
    reportedByUserId: "usr-user-02",
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
    confirmedByUserIds: ["usr-user-01"],
    details:
      "Cobblestone dislocation after heavy transit vehicle delivery. Severe rolling resistance for manual wheelchairs.",
    routeImpact: "Bypass using paved asphalt path 30m east through park promenade.",
    status: "active",
    moderationStatus: "submitted",
    reportedBy: "Wheelchair Marathoner",
  },
  {
    id: "rep-004",
    title: "Automatic Door Opener Restored",
    location: "Kulturforum Library, West Ramp",
    coordinates: {
      latitude: 52.5085,
      longitude: 13.3698,
    },
    category: "restroom",
    severity: "resolved",
    createdAt: "2026-11-24T12:00:00.000Z",
    timeAgo: "3 hours ago",
    confirmationCount: 6,
    confirmedByUserIds: ["usr-admin-01", "usr-user-01"],
    details:
      "The push-button automatic actuator on the West ground-floor accessible entrance is now fully operational.",
    routeImpact: "West ramp entrance is 100% accessible with no staff assistance required.",
    status: "resolved",
    moderationStatus: "resolved",
    reportedBy: "Library Facility Ops",
    moderatedBy: "usr-admin-01",
    moderatedAt: "2026-11-24T12:30:00.000Z",
    moderationNotes: "Facility manager confirmed repair completion.",
  },
];

function notifySubscribers(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("accessmate:reports-updated"));
  }
}

// In-memory cache synced with Supabase Realtime
let inMemoryReports: CommunityReport[] = [...INITIAL_COMMUNITY_REPORTS];
let isRealtimeInitialized = false;

async function initSupabaseSync() {
  if (typeof window === "undefined" || isRealtimeInitialized) return;
  isRealtimeInitialized = true;

  try {
    const { data, error } = await supabase
      .from("community_reports")
      .select(`
        id,
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        status,
        moderation_status,
        created_at,
        updated_at,
        report_confirmations(user_id)
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      inMemoryReports = data.map((row: any) => {
        const confirmations = Array.isArray(row.report_confirmations)
          ? row.report_confirmations.map((c: any) => c.user_id)
          : [];

        const date = new Date(row.created_at);
        const minutesAgo = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
        let timeAgo = `${minutesAgo} mins ago`;
        if (minutesAgo >= 60) {
          const hoursAgo = Math.floor(minutesAgo / 60);
          timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
        }

        return {
          id: row.id,
          title: row.title,
          location: row.title,
          coordinates: { latitude: row.latitude, longitude: row.longitude },
          category: row.category as any,
          severity: row.severity as any,
          createdAt: row.created_at,
          timeAgo,
          confirmationCount: confirmations.length,
          confirmedByUserIds: confirmations,
          details: row.description || "",
          routeImpact: row.description || "",
          status: row.status as any,
          moderationStatus: row.moderation_status as any,
        };
      });

      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(inMemoryReports));
      notifySubscribers();
    }

    // Subscribe to Realtime community_reports changes
    supabase
      .channel("reports-realtime-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_reports" },
        async () => {
          // Re-fetch to ensure relations are updated
          const { data: updatedData } = await supabase
            .from("community_reports")
            .select("*, report_confirmations(user_id)")
            .order("created_at", { ascending: false });

          if (updatedData) {
            inMemoryReports = updatedData.map((row: any) => ({
              id: row.id,
              title: row.title,
              location: row.title,
              coordinates: { latitude: row.latitude, longitude: row.longitude },
              category: row.category as any,
              severity: row.severity as any,
              createdAt: row.created_at,
              timeAgo: "Just now",
              confirmationCount: Array.isArray(row.report_confirmations) ? row.report_confirmations.length : 1,
              confirmedByUserIds: Array.isArray(row.report_confirmations) ? row.report_confirmations.map((c: any) => c.user_id) : [],
              details: row.description || "",
              routeImpact: row.description || "",
              status: row.status as any,
              moderationStatus: row.moderation_status as any,
            }));
            localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(inMemoryReports));
            notifySubscribers();
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn("Supabase reports realtime sync warning:", e);
  }
}

// Automatically trigger sync in browser
if (typeof window !== "undefined") {
  initSupabaseSync();
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

  getReportById(id: string): CommunityReport | null {
    return this.getReports().find((r) => r.id === id) ?? null;
  },

  saveReport(report: CommunityReport): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getReports();
      const updated = [report, ...current.filter((r) => r.id !== report.id)];
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      notifySubscribers();

      // Persist to Supabase asynchronously
      supabase
        .from("community_reports")
        .upsert({
          title: report.title,
          description: report.details,
          category: report.category,
          severity: report.severity,
          latitude: report.coordinates.latitude,
          longitude: report.coordinates.longitude,
          status: report.status,
          moderation_status: report.moderationStatus,
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase report upsert warning:", error.message);
        });
    } catch (err) {
      console.warn("Failed to save community report", err);
    }
  },

  /**
   * Confirm an existing obstacle.
   * Ensures distinct user confirmation: a given userId can only confirm once!
   */
  confirmReport(reportId: string, userId: string = "anonymous-user"): boolean {
    if (typeof window === "undefined") return false;
    try {
      const current = this.getReports();
      const target = current.find((r) => r.id === reportId);
      if (!target) return false;

      const confirmedSet = new Set(target.confirmedByUserIds ?? []);
      if (confirmedSet.has(userId)) {
        return false; // Already confirmed by this user!
      }

      confirmedSet.add(userId);
      const updatedReport: CommunityReport = {
        ...target,
        confirmationCount: target.confirmationCount + 1,
        confirmedByUserIds: Array.from(confirmedSet),
      };

      this.saveReport(updatedReport);

      // Async persist confirmation to Supabase report_confirmations
      supabase
        .from("report_confirmations")
        .insert({
          report_id: reportId,
          user_id: userId,
        })
        .then(() => {});

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Admin Moderation Operation:
   * Sets official verification, rejection, or resolution state and records an audit log.
   */
  moderateReport(
    reportId: string,
    moderatorId: string,
    moderatorName: string,
    newStatus: ReportModerationStatus,
    note?: string
  ): boolean {
    if (typeof window === "undefined") return false;
    try {
      const current = this.getReports();
      const target = current.find((r) => r.id === reportId);
      if (!target) return false;

      const prevStatus = target.moderationStatus;
      const updated: CommunityReport = {
        ...target,
        moderationStatus: newStatus,
        status: newStatus === "resolved" ? "resolved" : "active",
        moderatedBy: moderatorId,
        moderatedAt: new Date().toISOString(),
        moderationNotes: note ?? target.moderationNotes,
      };

      this.saveReport(updated);

      // Record Audit Log Entry
      const logEntry: ModerationLogEntry = {
        id: `mod-log-${Date.now()}`,
        reportId,
        moderatorId,
        moderatorName,
        previousStatus: prevStatus,
        newStatus,
        note,
        createdAt: new Date().toISOString(),
      };

      const existingLogs = this.getModerationLogs();
      localStorage.setItem(MODERATION_LOGS_KEY, JSON.stringify([logEntry, ...existingLogs]));

      // Async update in Supabase
      supabase
        .from("community_reports")
        .update({
          moderation_status: newStatus,
          status: newStatus === "resolved" ? "resolved" : "active",
        })
        .eq("id", reportId)
        .then(() => {});

      return true;
    } catch {
      return false;
    }
  },

  getModerationLogs(): ModerationLogEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(MODERATION_LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  deleteReport(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getReports();
      const filtered = current.filter((r) => r.id !== id);
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(filtered));
      notifySubscribers();

      supabase.from("community_reports").delete().eq("id", id).then(() => {});
    } catch (err) {
      console.warn("Failed to delete report", err);
    }
  },
};
