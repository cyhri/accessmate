/**
 * Demonstration Route Datasets & Benchmark Locations
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System (Phase 5)
 */

import type { GeocodingResult, FullRoutePlan } from "./types.ts";

export const DEMO_LOCATIONS: readonly GeocodingResult[] = [
  {
    id: "loc-central-station",
    name: "Central Railway Station",
    label: "Central Railway Station, Europaplatz 1",
    coordinates: { latitude: 52.5251, longitude: 13.3694 },
    locality: "Mitte",
    country: "Germany",
    confidence: 0.98,
  },
  {
    id: "loc-public-library",
    name: "City Public Library",
    label: "City Public Library, Kulturforum",
    coordinates: { latitude: 52.5208, longitude: 13.3725 },
    locality: "Tiergarten",
    country: "Germany",
    confidence: 0.95,
  },
  {
    id: "loc-general-hospital",
    name: "Metropolitan General Hospital",
    label: "Metropolitan General Hospital, Charitéplatz 1",
    coordinates: { latitude: 52.5275, longitude: 13.3850 },
    locality: "Mitte",
    country: "Germany",
    confidence: 0.92,
  },
  {
    id: "loc-civic-plaza",
    name: "Civic Plaza & Art Museum",
    label: "Civic Plaza, Museum Island 3",
    coordinates: { latitude: 52.5185, longitude: 13.3650 },
    locality: "Mitte",
    country: "Germany",
    confidence: 0.9,
  },
  {
    id: "loc-botanical-garden",
    name: "University Botanical Gardens",
    label: "University Botanical Gardens, West Entrance",
    coordinates: { latitude: 52.5150, longitude: 13.3800 },
    locality: "Schöneberg",
    country: "Germany",
    confidence: 0.88,
  },
];

/**
 * Generates synthetic benchmark route plans for development, automated testing,
 * and reliable demonstration without consuming external API quota.
 */
export function getDemoRoutePlan(
  origin: GeocodingResult,
  destination: GeocodingResult,
  isAlternative = false
): FullRoutePlan {
  const oLat = origin.coordinates.latitude;
  const oLng = origin.coordinates.longitude;
  const dLat = destination.coordinates.latitude;
  const dLng = destination.coordinates.longitude;

  // Generate intermediate waypoints between origin and destination
  const midLat1 = oLat + (dLat - oLat) * 0.33 + (isAlternative ? 0.0015 : -0.0008);
  const midLng1 = oLng + (dLng - oLng) * 0.33 + (isAlternative ? -0.0012 : 0.0006);

  const midLat2 = oLat + (dLat - oLat) * 0.66 + (isAlternative ? 0.0018 : -0.0005);
  const midLng2 = oLng + (dLng - oLng) * 0.66 + (isAlternative ? -0.0010 : 0.0004);

  const coordinates: [number, number][] = [
    [oLat, oLng],
    [midLat1, midLng1],
    [midLat2, midLng2],
    [dLat, dLng],
  ];

  if (isAlternative) {
    // Alternative route: Contains historic cobblestones and 4 stairs
    return {
      id: `demo-route-alt-${Date.now()}`,
      name: `Alternative Historic Route via Old Town (${origin.name} → ${destination.name})`,
      origin: origin.coordinates,
      destination: destination.coordinates,
      originLabel: origin.label,
      destinationLabel: destination.label,
      coordinates,
      distanceMeters: 540,
      durationMinutes: 9,
      elevationGainMeters: 4,
      elevationLossMeters: 2,
      steps: [
        {
          instruction: `Depart from ${origin.name} heading south along cobblestone alley`,
          distanceMeters: 180,
          durationSeconds: 180,
          name: "Old Market Passage",
          type: 11,
          wayPoints: [0, 1],
        },
        {
          instruction: "Ascend short flight of 4 steps at church square crossing",
          distanceMeters: 160,
          durationSeconds: 180,
          name: "St. Nicholas Steps",
          type: 12,
          wayPoints: [1, 2],
        },
        {
          instruction: `Arrive at destination: ${destination.name}`,
          distanceMeters: 200,
          durationSeconds: 180,
          name: "Cathedral Way",
          type: 10,
          wayPoints: [2, 3],
        },
      ],
      characteristics: {
        totalDistanceMeters: 540,
        estimatedDurationMinutes: 9,
        maxInclinePercent: 7,
        steepSegmentsPercent: 15,
        surfaceDistribution: {
          cobblestone: 45,
          asphalt: 35,
          paved: 20,
        },
        unknownSurfacePercent: 0,
        unknownInclinePercent: 0,
        hasKnownSteps: true,
        knownStepsCount: 4,
        wayTypes: ["pedestrian_street", "historic_alley"],
      },
      isAlternative: true,
      dataSource: "demo_network",
      warningNotice: "Demo Route: Includes confirmed steps and cobblestone surface for barrier testing.",
    };
  }

  // Primary route: Optimal, fully smooth, step-free
  return {
    id: `demo-route-primary-${Date.now()}`,
    name: `Primary Wheelchair Accessible Corridor (${origin.name} → ${destination.name})`,
    origin: origin.coordinates,
    destination: destination.coordinates,
    originLabel: origin.label,
    destinationLabel: destination.label,
    coordinates,
    distanceMeters: 620,
    durationMinutes: 8,
    elevationGainMeters: 2,
    elevationLossMeters: 1,
    steps: [
      {
        instruction: `Head south along wide pedestrian concourse from ${origin.name}`,
        distanceMeters: 220,
        durationSeconds: 160,
        name: "Europaplatz Concourse",
        type: 11,
        wayPoints: [0, 1],
      },
      {
        instruction: "Turn right onto accessible dropped-curb sidewalk",
        distanceMeters: 240,
        durationSeconds: 180,
        name: "Friedrich Avenue Sidewalk",
        type: 1,
        wayPoints: [1, 2],
      },
      {
        instruction: `Continue straight to main entrance of ${destination.name}`,
        distanceMeters: 160,
        durationSeconds: 140,
        name: "Library Plaza",
        type: 10,
        wayPoints: [2, 3],
      },
    ],
    characteristics: {
      totalDistanceMeters: 620,
      estimatedDurationMinutes: 8,
      maxInclinePercent: 2,
      steepSegmentsPercent: 0,
      surfaceDistribution: {
        asphalt: 85,
        concrete: 15,
      },
      unknownSurfacePercent: 0,
      unknownInclinePercent: 0,
      hasKnownSteps: false,
      knownStepsCount: 0,
      wayTypes: ["dedicated_footway", "pedestrian_crossing"],
      hasKnownTactilePaving: true,
    },
    isAlternative: false,
    dataSource: "demo_network",
    warningNotice: "Simulated demonstration network route for offline development and testing.",
  };
}
