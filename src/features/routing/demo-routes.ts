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

// High-fidelity pre-mapped pedestrian corridor between Central Station and Kulturforum
const BENCHMARK_STREET_COORDINATES: readonly [number, number][] = [
  [52.525149, 13.369415], // Europaplatz / Central Station exit
  [52.525245, 13.369396], // Station north pedestrian concourse
  [52.525249, 13.369454], // Turn east along station plaza
  [52.525195, 13.369493], // Ramp access to Washingtonplatz
  [52.524850, 13.369650], // Washingtonplatz south terrace
  [52.524200, 13.369720], // Spree river promenade
  [52.523800, 13.369850], // Approach Moltkebrücke
  [52.523450, 13.370200], // Moltkebrücke pedestrian sidewalk crossing
  [52.522900, 13.370350], // South bank Spree bridge ramp
  [52.522400, 13.370420], // Willy-Brandt-Straße crossing
  [52.521800, 13.370500], // Chancellery park pedestrian path
  [52.521200, 13.370600], // Spreebogenpark paved path
  [52.520850, 13.371200], // Paul-Löbe-Haus west passage
  [52.520400, 13.371800], // Otto-von-Bismarck-Allee sidewalk
  [52.520000, 13.372100], // Reichstagufer pedestrian crossing
  [52.519500, 13.372200], // Scheidemannstraße tactile crossing
  [52.518800, 13.372150], // Simsonweg entry into Tiergarten
  [52.517500, 13.371900], // Tiergarten main paved promenade
  [52.516000, 13.371600], // Southward along Tiergarten asphalt path
  [52.514500, 13.371300], // Intersection with Straße des 17. Juni
  [52.513000, 13.371100], // Kemperplatz access corridor
  [52.511800, 13.371350], // Philharmonie north entrance
  [52.510500, 13.371600], // Herbert-von-Karajan-Straße
  [52.509200, 13.371900], // Matthäikirchplatz
  [52.508200, 13.372200], // Kulturforum main public plaza
  [52.507500, 13.372500], // City Public Library (Staatsbibliothek) entrance
];

/**
 * Generates street-following coordinates for demo mode.
 * For the default Central Station -> Library route, uses the pre-mapped street corridor.
 * For other locations, generates an orthogonal street grid path following urban blocks.
 */
function generateStreetFollowingCoordinates(
  oLat: number,
  oLng: number,
  dLat: number,
  dLng: number,
  isAlt: boolean
): [number, number][] {
  // If routing between the default benchmark locations (Station & Library in Berlin)
  const isDefaultPair =
    Math.abs(oLat - 52.5251) < 0.005 &&
    Math.abs(oLng - 13.3694) < 0.005 &&
    Math.abs(dLat - 52.5208) < 0.015 &&
    Math.abs(dLng - 13.3725) < 0.015;

  if (isDefaultPair) {
    if (!isAlt) {
      return [...BENCHMARK_STREET_COORDINATES] as [number, number][];
    }
    // Alternative route via Old Town / Friedrichstraße with steps
    return BENCHMARK_STREET_COORDINATES.map(([lat, lng], idx) => {
      const offsetLng = idx > 5 && idx < 20 ? 0.0025 : 0;
      return [lat, lng + offsetLng] as [number, number];
    });
  }

  // Orthogonal Street-Grid Path Generator (L-shaped urban block turns instead of diagonal cut)
  const waypoints: [number, number][] = [[oLat, oLng]];
  const latDelta = dLat - oLat;
  const lngDelta = dLng - oLng;

  // Follow 4 urban street segments
  const seg1Lat = oLat + latDelta * 0.45;
  const seg1Lng = oLng;
  waypoints.push([seg1Lat, seg1Lng]);

  const seg2Lat = seg1Lat;
  const seg2Lng = oLng + lngDelta * (isAlt ? 0.65 : 0.55);
  waypoints.push([seg2Lat, seg2Lng]);

  const seg3Lat = dLat;
  const seg3Lng = seg2Lng;
  waypoints.push([seg3Lat, seg3Lng]);

  waypoints.push([dLat, dLng]);
  return waypoints;
}

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

  const coordinates = generateStreetFollowingCoordinates(oLat, oLng, dLat, dLng, isAlternative);

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
