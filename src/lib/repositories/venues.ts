import { supabase } from "@/lib/supabase/client";
import type { Venue } from "@/features/venues/types";
import { INITIAL_VENUES } from "@/features/venues/venues-repository";

export const venuesRepository = {
  /**
   * Fetch all published or accessible venues from Supabase.
   */
  async getAllVenues(): Promise<Venue[]> {
    try {
      const { data, error } = await supabase
        .from("venues")
        .select(`
          id,
          name,
          description,
          category,
          address,
          latitude,
          longitude,
          publication_status,
          created_at,
          updated_at,
          building_assessments(id)
        `)
        .order("name", { ascending: true });

      if (error) {
        console.error("Supabase venues query error:", error.message);
        return [...INITIAL_VENUES];
      }

      if (!data || data.length === 0) {
        return [...INITIAL_VENUES];
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: (row.category as any) || "other",
        description: row.description || "",
        address: row.address,
        coordinates: {
          latitude: row.latitude,
          longitude: row.longitude,
        },
        publicationStatus: row.publication_status,
        buildingAssessmentIds: Array.isArray(row.building_assessments)
          ? row.building_assessments.map((b: any) => b.id)
          : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error("venuesRepository.getAllVenues error:", err);
      return [...INITIAL_VENUES];
    }
  },

  /**
   * Fetch a single venue by ID.
   */
  async getVenueById(id: string): Promise<Venue | null> {
    const { data, error } = await supabase
      .from("venues")
      .select(`
        id,
        name,
        description,
        category,
        address,
        latitude,
        longitude,
        publication_status,
        created_at,
        updated_at,
        building_assessments(id)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: (data.category as any) || "other",
      description: data.description || "",
      address: data.address,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      publicationStatus: data.publication_status,
      buildingAssessmentIds: Array.isArray((data as any).building_assessments)
        ? (data as any).building_assessments.map((b: any) => b.id)
        : [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Save or update a venue (Admin only).
   */
  async saveVenue(venue: Partial<Venue> & { name: string; address: string; coordinates: { latitude: number; longitude: number } }): Promise<Venue> {
    const payload = {
      name: venue.name,
      description: venue.description || null,
      category: venue.category || "other",
      address: venue.address,
      latitude: venue.coordinates.latitude,
      longitude: venue.coordinates.longitude,
      publication_status: venue.publicationStatus || "published",
      updated_at: new Date().toISOString(),
    };

    if (venue.id && !venue.id.startsWith("ven-")) {
      const { data, error } = await supabase
        .from("venues")
        .update(payload)
        .eq("id", venue.id)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category as any,
        description: data.description || "",
        address: data.address,
        coordinates: { latitude: data.latitude, longitude: data.longitude },
        publicationStatus: data.publication_status,
        buildingAssessmentIds: venue.buildingAssessmentIds || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      const { data, error } = await supabase
        .from("venues")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: data.category as any,
        description: data.description || "",
        address: data.address,
        coordinates: { latitude: data.latitude, longitude: data.longitude },
        publicationStatus: data.publication_status,
        buildingAssessmentIds: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  },

  /**
   * Delete a venue (Admin only).
   */
  async deleteVenue(id: string): Promise<boolean> {
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  /**
   * Subscribe to venue changes via Realtime.
   */
  subscribeToVenues(onUpdate: () => void): () => void {
    const channel = supabase
      .channel("venues-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venues" },
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
