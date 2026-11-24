import { supabase } from "@/lib/supabase/client";
import type {
  CommunityReport,
  ReportCategory,
  ReportSeverity,
  ReportModerationStatus,
} from "@/features/reports/types";
import { INITIAL_COMMUNITY_REPORTS } from "@/features/reports/reports-storage";

export const reportsRepository = {
  /**
   * Fetch all active & community-visible reports from Supabase.
   * Includes live confirmation counts and per-user confirmation IDs.
   */
  async getReports(): Promise<CommunityReport[]> {
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

      if (error) {
        console.error("Supabase getReports error:", error.message);
        return [...INITIAL_COMMUNITY_REPORTS];
      }

      if (!data || data.length === 0) {
        return [...INITIAL_COMMUNITY_REPORTS];
      }

      return data.map((row: any) => {
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
          coordinates: {
            latitude: row.latitude,
            longitude: row.longitude,
          },
          category: row.category as ReportCategory,
          severity: row.severity as ReportSeverity,
          createdAt: row.created_at,
          timeAgo,
          confirmationCount: confirmations.length,
          confirmedByUserIds: confirmations,
          details: row.description || "",
          routeImpact: row.description || "",
          status: row.status as "active" | "resolved",
          moderationStatus: row.moderation_status as ReportModerationStatus,
        };
      });
    } catch (err) {
      console.error("reportsRepository.getReports error:", err);
      return [...INITIAL_COMMUNITY_REPORTS];
    }
  },

  /**
   * Submit a new community obstacle report.
   */
  async submitReport(report: {
    title: string;
    description: string;
    category: ReportCategory;
    severity: ReportSeverity;
    latitude: number;
    longitude: number;
  }): Promise<CommunityReport> {
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      reporter_id: user?.id || null,
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      latitude: report.latitude,
      longitude: report.longitude,
      status: "active" as const,
      moderation_status: "submitted" as const,
    };

    const { data, error } = await supabase
      .from("community_reports")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      location: data.title,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      category: data.category as ReportCategory,
      severity: data.severity as ReportSeverity,
      createdAt: data.created_at,
      timeAgo: "Just now",
      confirmationCount: 0,
      confirmedByUserIds: [],
      details: data.description || "",
      routeImpact: data.description || "",
      status: "active",
      moderationStatus: "submitted",
    };
  },

  /**
   * Confirm an existing obstacle report (Deduplicated per user).
   */
  async confirmReport(reportId: string, userId?: string): Promise<{ success: boolean; confirmationCount: number }> {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Must be logged in to confirm a community hazard.");
      }
      targetUserId = user.id;
    }

    // Insert into report_confirmations (handled by unique constraint)
    const { error } = await supabase.from("report_confirmations").insert({
      report_id: reportId,
      user_id: targetUserId,
    });

    if (error) {
      // 23505 is PostgreSQL unique constraint violation (already confirmed)
      if (error.code === "23505") {
        const { count } = await supabase
          .from("report_confirmations")
          .select("*", { count: "exact", head: true })
          .eq("report_id", reportId);
        return { success: false, confirmationCount: count || 1 };
      }
      throw error;
    }

    const { count } = await supabase
      .from("report_confirmations")
      .select("*", { count: "exact", head: true })
      .eq("report_id", reportId);

    return { success: true, confirmationCount: count || 1 };
  },

  /**
   * Moderate a community report (Admin only).
   */
  async moderateReport(
    reportId: string,
    newStatus: ReportModerationStatus,
    moderatorId?: string,
    moderatorName?: string,
    notes?: string
  ): Promise<boolean> {
    const isResolved = newStatus === "resolved";

    const { error: updateError } = await supabase
      .from("community_reports")
      .update({
        moderation_status: newStatus,
        status: isResolved ? "resolved" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateError) throw updateError;

    // Record moderation audit history
    await supabase.from("report_moderation_history").insert({
      report_id: reportId,
      admin_id: moderatorId || null,
      previous_status: "unknown",
      new_status: newStatus,
      moderation_notes: notes || `Moderated by ${moderatorName || "admin"}`,
    });

    return true;
  },

  /**
   * Realtime subscription for community reports.
   * Enables instant alerts when new obstacles are posted or verified.
   */
  subscribeToReports(onEvent: (report: CommunityReport) => void): () => void {
    const channel = supabase
      .channel("community-reports-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_reports" },
        async (payload: any) => {
          if (payload.new) {
            const row = payload.new;
            onEvent({
              id: row.id,
              title: row.title,
              location: row.title,
              coordinates: { latitude: row.latitude, longitude: row.longitude },
              category: row.category,
              severity: row.severity,
              createdAt: row.created_at,
              timeAgo: "Just now",
              confirmationCount: 1,
              confirmedByUserIds: [],
              details: row.description || "",
              routeImpact: row.description || "",
              status: row.status,
              moderationStatus: row.moderation_status,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
