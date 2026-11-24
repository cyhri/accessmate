import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import type { BuildingAssessmentRecord } from "@/types/assessment";
import { SAMPLE_BUILDING_ASSESSMENTS } from "@/lib/storage/sample-data";

export const assessmentsRepository = {
  /**
   * Fetch all building assessments from Supabase.
   */
  async getAssessments(): Promise<BuildingAssessmentRecord[]> {
    try {
      const { data, error } = await supabase
        .from("building_assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase getAssessments error:", error.message);
        return [...SAMPLE_BUILDING_ASSESSMENTS];
      }

      if (!data || data.length === 0) {
        return [...SAMPLE_BUILDING_ASSESSMENTS];
      }

      return data.map((row) => {
        const parsed = (row.assessment_data as any) || {};
        return {
          id: row.id,
          general: {
            name: parsed.general?.name || "Building Facility",
            buildingType: parsed.general?.buildingType || "public_facility",
            address: parsed.general?.address || "",
            floorsCount: parsed.general?.floorsCount || 1,
            assessmentDate: parsed.general?.assessmentDate || row.created_at.slice(0, 10),
            notes: row.audit_notes || parsed.general?.notes || "",
          },
          entrance: parsed.entrance || SAMPLE_BUILDING_ASSESSMENTS[0]?.entrance,
          internalMovement: parsed.internalMovement || SAMPLE_BUILDING_ASSESSMENTS[0]?.internalMovement,
          restroom: parsed.restroom || SAMPLE_BUILDING_ASSESSMENTS[0]?.restroom,
        } as BuildingAssessmentRecord;
      });
    } catch (err) {
      console.error("assessmentsRepository.getAssessments error:", err);
      return [...SAMPLE_BUILDING_ASSESSMENTS];
    }
  },

  /**
   * Fetch single assessment by ID.
   */
  async getAssessmentById(id: string): Promise<BuildingAssessmentRecord | null> {
    const list = await this.getAssessments();
    return list.find((a) => a.id === id) ?? null;
  },

  /**
   * Save or update an assessment record (Admin only).
   */
  async saveAssessment(record: BuildingAssessmentRecord): Promise<BuildingAssessmentRecord> {
    const payload = {
      assessment_status: "verified" as const,
      assessment_data: {
        general: record.general,
        entrance: record.entrance,
        internalMovement: record.internalMovement,
        restroom: record.restroom,
      } as unknown as Json,
      audit_notes: record.general.notes,
      updated_at: new Date().toISOString(),
    };

    if (record.id && !record.id.startsWith("sample-") && !record.id.startsWith("assessment-")) {
      const { data, error } = await supabase
        .from("building_assessments")
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();

      if (error) throw error;
      return record;
    } else {
      // Find or associate venue_id
      const { data: venueData } = await supabase
        .from("venues")
        .select("id")
        .limit(1)
        .single();

      const venueId = venueData?.id;
      if (!venueId) {
        throw new Error("Cannot save assessment: No venues exist to associate.");
      }

      const { data, error } = await supabase
        .from("building_assessments")
        .insert({
          ...payload,
          venue_id: venueId,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...record, id: data.id };
    }
  },

  /**
   * Delete an assessment record (Admin only).
   */
  async deleteAssessment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("building_assessments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  /**
   * Subscribe to assessment changes via Realtime.
   */
  subscribeToAssessments(onUpdate: () => void): () => void {
    const channel = supabase
      .channel("assessments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "building_assessments" },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
