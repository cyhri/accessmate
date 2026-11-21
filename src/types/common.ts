/**
 * Common Type Definitions
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export interface BaseEntity {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type Nullable<T> = T | null;

export interface GeoCoordinates {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitudeMeters?: number;
}

export interface Address {
  readonly street?: string;
  readonly city?: string;
  readonly postalCode?: string;
  readonly stateOrProvince?: string;
  readonly country?: string;
  readonly formattedAddress: string;
}
