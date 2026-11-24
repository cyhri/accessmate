import type { GeoCoordinates } from "@/types/common";

export type VenueCategory =
  | "transport"
  | "culture"
  | "healthcare"
  | "civic"
  | "commercial"
  | "education"
  | "recreation"
  | "other";

export type VenuePublicationStatus = "draft" | "published" | "archived";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  category: VenueCategory;
  description: string;
  address: string;
  coordinates: GeoCoordinates;
  publicationStatus: VenuePublicationStatus;
  buildingAssessmentIds?: string[];
  createdAt: string;
  updatedAt: string;
}
