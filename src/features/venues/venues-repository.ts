import type { Venue } from "./types";
import { supabase } from "@/lib/supabase/client";

export const VENUES_STORAGE_KEY = "accessmate_venues_registry";

export const INITIAL_VENUES: readonly Venue[] = [
  {
    id: "ven-001",
    name: "Berlin Central Station (Hauptbahnhof)",
    slug: "berlin-central-station",
    category: "transport",
    description: "Multilevel international rail terminal with tactile transit corridors and elevator hubs.",
    address: "Europaplatz 1, 10557 Berlin",
    coordinates: {
      latitude: 52.5255,
      longitude: 13.3695,
    },
    publicationStatus: "published",
    buildingAssessmentIds: ["asm-001"],
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-11-20T10:00:00.000Z",
  },
  {
    id: "ven-002",
    name: "City Public Library (Kulturforum)",
    slug: "city-public-library-kulturforum",
    category: "culture",
    description: "Major civic public library with wide automatic doors, elevator access to reading rooms, and accessible restrooms.",
    address: "Matthäikirchplatz 4, 10785 Berlin",
    coordinates: {
      latitude: 52.5085,
      longitude: 13.3698,
    },
    publicationStatus: "published",
    buildingAssessmentIds: ["asm-002"],
    createdAt: "2026-02-14T11:30:00.000Z",
    updatedAt: "2026-11-22T14:15:00.000Z",
  },
  {
    id: "ven-003",
    name: "Charité University Medical Center",
    slug: "charite-medical-center",
    category: "healthcare",
    description: "Comprehensive medical center with step-free entrance ramps, automatic hospital doors, and tactile ground paving.",
    address: "Charitéplatz 1, 10117 Berlin",
    coordinates: {
      latitude: 52.5262,
      longitude: 13.3789,
    },
    publicationStatus: "published",
    buildingAssessmentIds: ["asm-003"],
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-11-18T16:45:00.000Z",
  },
  {
    id: "ven-004",
    name: "Spreebogenpark Community Pavilion",
    slug: "spreebogenpark-pavilion",
    category: "recreation",
    description: "Public waterfront recreational pavilion with level boardwalk paths and accessible visitor facilities.",
    address: "Alt-Moabit 140, 10557 Berlin",
    coordinates: {
      latitude: 52.5218,
      longitude: 13.3685,
    },
    publicationStatus: "published",
    buildingAssessmentIds: [],
    createdAt: "2026-04-12T13:00:00.000Z",
    updatedAt: "2026-11-23T09:20:00.000Z",
  },
];

function notifyVenueSubscribers(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("accessmate:venues-updated"));
  }
}

// In-memory cache synced with Supabase Realtime
let inMemoryVenues: Venue[] = [...INITIAL_VENUES];
let isVenueSyncInitialized = false;

async function initSupabaseVenuesSync() {
  if (typeof window === "undefined" || isVenueSyncInitialized) return;
  isVenueSyncInitialized = true;

  try {
    const { data, error } = await supabase
      .from("venues")
      .select("*, building_assessments(id)")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      inMemoryVenues = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: (row.category as any) || "other",
        description: row.description || "",
        address: row.address,
        coordinates: { latitude: row.latitude, longitude: row.longitude },
        publicationStatus: row.publication_status,
        buildingAssessmentIds: Array.isArray(row.building_assessments)
          ? row.building_assessments.map((b: any) => b.id)
          : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(inMemoryVenues));
      notifyVenueSubscribers();
    }

    // Subscribe to venue changes
    supabase
      .channel("venues-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "venues" },
        async () => {
          const { data: updated } = await supabase
            .from("venues")
            .select("*, building_assessments(id)")
            .order("name", { ascending: true });

          if (updated) {
            inMemoryVenues = updated.map((row: any) => ({
              id: row.id,
              name: row.name,
              slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              category: row.category as any,
              description: row.description || "",
              address: row.address,
              coordinates: { latitude: row.latitude, longitude: row.longitude },
              publicationStatus: row.publication_status,
              buildingAssessmentIds: Array.isArray(row.building_assessments)
                ? row.building_assessments.map((b: any) => b.id)
                : [],
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            }));
            localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(inMemoryVenues));
            notifyVenueSubscribers();
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Supabase venues sync warning:", err);
  }
}

if (typeof window !== "undefined") {
  initSupabaseVenuesSync();
}

export const venuesRepository = {
  getVenues(): Venue[] {
    if (typeof window === "undefined") {
      return [...INITIAL_VENUES];
    }
    try {
      const stored = localStorage.getItem(VENUES_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(INITIAL_VENUES));
        return [...INITIAL_VENUES];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(INITIAL_VENUES));
        return [...INITIAL_VENUES];
      }
      return parsed;
    } catch {
      return [...INITIAL_VENUES];
    }
  },

  getVenueById(id: string): Venue | null {
    return this.getVenues().find((v) => v.id === id) ?? null;
  },

  saveVenue(venue: Venue): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getVenues();
      const updated = [venue, ...current.filter((v) => v.id !== venue.id)];
      localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(updated));
      notifyVenueSubscribers();

      // Persist to Supabase asynchronously
      supabase
        .from("venues")
        .upsert({
          name: venue.name,
          description: venue.description,
          category: venue.category,
          address: venue.address,
          latitude: venue.coordinates.latitude,
          longitude: venue.coordinates.longitude,
          publication_status: venue.publicationStatus,
        })
        .then(() => {});
    } catch (err) {
      console.warn("Failed to save venue to storage", err);
    }
  },

  deleteVenue(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getVenues();
      const filtered = current.filter((v) => v.id !== id);
      localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(filtered));
      notifyVenueSubscribers();

      supabase.from("venues").delete().eq("id", id).then(() => {});
    } catch (err) {
      console.warn("Failed to delete venue from storage", err);
    }
  },

  searchVenues(query: string): Venue[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getVenues();
    return this.getVenues().filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  },
};
