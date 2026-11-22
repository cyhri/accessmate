
// ---------------------------------------------------------------------------
// ACCESSMATE – Routing module test suite
// Uses built-in Node test APIs with strict TypeScript typing.
// ---------------------------------------------------------------------------

import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

import {
  leafletToORS,
  orsToLeaflet,
  geoCoordsToORS,
  orsToGeoCoords,
  buildORSWheelchairRestrictions,
  decodeORSSurfaceValue,
  decodeORSSteepnessCode,
  parseORSGeoJSONResponse,
} from "../src/features/routing/ors-client";

import type { UserAccessibilityProfile } from "../src/types/profile";
import type { GeoCoordinates } from "../src/types/common";
import type {
  FullRoutePlan,
  ORSGeoJSONResponse,
} from "../src/features/routing/types";

import { RouteInferenceEngine } from "../src/features/routing/engine/route-inference-engine";
import { getDefaultProfile } from "../src/lib/storage/profile-storage";
import { POST } from "../src/app/api/routes/directions/route";

// ---------------------------------------------------------------------------
// Typed fetch mock helpers
// ---------------------------------------------------------------------------

function setFetchSuccess(body: unknown, status = 200): void {
  globalThis.fetch = async (): Promise<Response> =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
}

function setFetchError(status: number): void {
  globalThis.fetch = async (): Promise<Response> =>
    new Response(null, { status });
}

function setFetchReject(message: string): void {
  globalThis.fetch = async (): Promise<Response> => {
    throw new DOMException(message, message);
  };
}

type DirectionsResponse = {
  source?: string;
  notice?: string;
  routes?: Array<{
    assessment?: unknown;
  }>;
};

async function readDirectionsResponse(
  response: Response,
): Promise<DirectionsResponse> {
  return (await response.json()) as DirectionsResponse;
}

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.ORS_API_KEY;

// ---------------------------------------------------------------------------
// Coordinate conversion utilities
// ---------------------------------------------------------------------------

describe("Coordinate conversion utilities", () => {
  test("leafletToORS swaps latitude and longitude", () => {
    assert.deepStrictEqual(leafletToORS([10, 20]), [20, 10]);
  });

  test("orsToLeaflet swaps coordinates back", () => {
    assert.deepStrictEqual(orsToLeaflet([30, 40, 5]), [40, 30]);
  });

  test("geoCoordsToORS produces [longitude, latitude]", () => {
    const coordinates: GeoCoordinates = {
      latitude: 12.34,
      longitude: 56.78,
    };

    assert.deepStrictEqual(geoCoordsToORS(coordinates), [56.78, 12.34]);
  });

  test("orsToGeoCoords builds full GeoCoordinates", () => {
    const coordinates = [100, 50, 10] as const;

    assert.deepStrictEqual(orsToGeoCoords(coordinates), {
      latitude: 50,
      longitude: 100,
      altitudeMeters: 10,
    });
  });
});

// ---------------------------------------------------------------------------
// ORS wheelchair restrictions builder
// ---------------------------------------------------------------------------

describe("ORS wheelchair restrictions builder", () => {
  test("includes maximum incline when profile specifies ramp slope", () => {
    const defaultProfile = getDefaultProfile();

    const profile: UserAccessibilityProfile = {
      ...defaultProfile,
      mobility: {
        ...defaultProfile.mobility,
        maxRampSlopePercent: 8,
      },
    };

    const { options } = buildORSWheelchairRestrictions(profile);

    assert.strictEqual(
      options.profile_params?.restrictions?.maximum_incline,
      8,
    );
  });

  test("defaults to 6 percent incline for wheelchair users", () => {
    const defaultProfile = getDefaultProfile();

    const profile: UserAccessibilityProfile = {
      ...defaultProfile,
      mobility: {
        ...defaultProfile.mobility,
        usesWheelchair: true,
      },
    };

    const { options } = buildORSWheelchairRestrictions(profile);

    assert.strictEqual(
      options.profile_params?.restrictions?.maximum_incline,
      6,
    );
  });

  test("sets maximum sloped kerb based on step height", () => {
    const defaultProfile = getDefaultProfile();

    const profile: UserAccessibilityProfile = {
      ...defaultProfile,
      mobility: {
        ...defaultProfile.mobility,
        maxStepHeightCm: 7,
      },
    };

    const { options } = buildORSWheelchairRestrictions(profile);

    assert.ok(
      Math.abs(
        (options.profile_params?.restrictions?.maximum_sloped_kerb ?? 0) -
          0.07,
      ) < 1e-9,
    );
  });

  test("adds steps to avoid_features for essential step-free access", () => {
    const defaultProfile = getDefaultProfile();

    const profile: UserAccessibilityProfile = {
      ...defaultProfile,
      mobility: {
        ...defaultProfile.mobility,
        requiresStepFreeAccess: "essential",
      },
    };

    const { options } = buildORSWheelchairRestrictions(profile);

    assert.ok((options.avoid_features ?? []).includes("steps"));
  });
});

// ---------------------------------------------------------------------------
// Surface and steepness decoding
// ---------------------------------------------------------------------------

describe("Surface and steepness decoding", () => {
  test("decodes known numeric surface values", () => {
    assert.strictEqual(decodeORSSurfaceValue(1), "paved");
    assert.strictEqual(decodeORSSurfaceValue(5), "cobblestone");
  });

  test("passes through string surface values", () => {
    assert.strictEqual(decodeORSSurfaceValue("Gravel"), "gravel");
  });

  test("returns unknown for unrecognized numeric surface values", () => {
    assert.strictEqual(decodeORSSurfaceValue(99), "unknown");
  });

  test("decodes steepness codes into percentages", () => {
    assert.strictEqual(decodeORSSteepnessCode(3), 9);
    assert.strictEqual(decodeORSSteepnessCode(-4), 15);
    assert.strictEqual(decodeORSSteepnessCode(0), 0);
  });
});

// ---------------------------------------------------------------------------
// ORS GeoJSON parsing
// ---------------------------------------------------------------------------

describe("ORS GeoJSON parsing", () => {
  const dummyGeojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 20],
            [11, 21],
          ],
        },
        properties: {
          summary: {
            distance: 1200.4,
            duration: 600,
          },
          segments: [
            {
              steps: [
                {
                  instruction: "Continue straight",
                  distance: 500,
                  duration: 300,
                  name: "Main St",
                  type: 11,
                  way_points: [0, 1],
                },
                {
                  instruction: "Take stairs up",
                  distance: 100,
                  duration: 60,
                  name: "Stairs",
                  type: 13,
                  way_points: [1, 2],
                },
              ],
            },
          ],
        },
      },
    ],
  } as unknown as ORSGeoJSONResponse;

  test("parses geometry into Leaflet coordinates", () => {
    const plan = parseORSGeoJSONResponse(dummyGeojson, "A", "B");

    assert.deepStrictEqual(plan.coordinates, [
      [20, 10],
      [21, 11],
    ]);
  });

  test("extracts distance and duration correctly", () => {
    const plan = parseORSGeoJSONResponse(dummyGeojson, "A", "B");

    assert.strictEqual(plan.distanceMeters, 1200);
    assert.strictEqual(plan.durationMinutes, 10);
  });

  test("detects steps in route instructions", () => {
    const plan = parseORSGeoJSONResponse(dummyGeojson, "A", "B");

    const stepCount = plan.steps.filter((step) =>
      /stairs|steps|staircase/i.test(step.instruction),
    ).length;

    assert.ok(stepCount > 0);
  });

  test("throws when route geometry is missing", () => {
    const broken = {
      ...dummyGeojson,
      features: [
        {
          ...dummyGeojson.features[0],
          geometry: undefined,
        },
      ],
    } as unknown as ORSGeoJSONResponse;

    assert.throws(
      () => parseORSGeoJSONResponse(broken, "A", "B"),
      /Invalid or empty route geometry/,
    );
  });
});

// ---------------------------------------------------------------------------
// Route inference deterministic behavior
// ---------------------------------------------------------------------------

describe("Route inference deterministic behavior", () => {
  const profile = getDefaultProfile();

  const plan: FullRoutePlan = {
    id: "demo",
    dataSource: "demo_network",
    name: "Demo",

    origin: {
      latitude: 0,
      longitude: 0,
    },

    destination: {
      latitude: 0.001,
      longitude: 0.001,
    },

    originLabel: "A",
    destinationLabel: "B",

    coordinates: [
      [0, 0],
      [0.001, 0.001],
    ],

    distanceMeters: 150,
    durationMinutes: 2,
    steps: [],

    characteristics: {
      totalDistanceMeters: 150,
      estimatedDurationMinutes: 2,
      maxInclinePercent: 0,
      steepSegmentsPercent: 0,
      surfaceDistribution: {
        unknown: 100,
      },
      unknownSurfacePercent: 100,
      unknownInclinePercent: 100,
      hasKnownSteps: false,
      knownStepsCount: 0,
      wayTypes: [],
    },
  };

  test("same input produces identical inference results", () => {
    const first = RouteInferenceEngine.evaluate(profile, plan);
    const second = RouteInferenceEngine.evaluate(profile, plan);

    assert.deepStrictEqual(first.barriers, second.barriers);
    assert.deepStrictEqual(
      first.explanationTraces,
      second.explanationTraces,
    );
  });
});

// ---------------------------------------------------------------------------
// Routing API endpoint tests
// ---------------------------------------------------------------------------

describe("Routing API endpoint", () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.ORS_API_KEY;
    } else {
      process.env.ORS_API_KEY = originalApiKey;
    }
  });

  test("returns demo source when ORS API key is missing", async () => {
    process.env.ORS_API_KEY = "";

    const request = new Request(
      "http://localhost/api/routes/directions",
      {
        method: "POST",
        body: JSON.stringify({
          origin: {
            latitude: 0,
            longitude: 0,
          },
          destination: {
            latitude: 1,
            longitude: 1,
          },
        }),
      },
    );

    const response = await POST(request);
    const json = await readDirectionsResponse(response);

    assert.strictEqual(json.source, "demo_network");
    assert.ok(/ORS_API_KEY not configured/.test(json.notice ?? ""));
  });

  test("labels successful live ORS responses correctly", async () => {
    process.env.ORS_API_KEY = "valid-key";

    const geojsonBody = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          properties: {
            summary: {
              distance: 1000,
              duration: 600,
            },
            segments: [],
          },
        },
      ],
    };

    setFetchSuccess(geojsonBody);

    const request = new Request(
      "http://localhost/api/routes/directions",
      {
        method: "POST",
        body: JSON.stringify({
          origin: {
            latitude: 0,
            longitude: 0,
          },
          destination: {
            latitude: 1,
            longitude: 1,
          },
        }),
      },
    );

    const response = await POST(request);
    const json = await readDirectionsResponse(response);

    assert.strictEqual(json.source, "live_ors");
    assert.ok(json.routes?.[0]?.assessment);
  });

  test("falls back to demo for authentication errors", async () => {
    process.env.ORS_API_KEY = "invalid-key";

    setFetchError(401);

    const request = new Request(
      "http://localhost/api/routes/directions",
      {
        method: "POST",
        body: JSON.stringify({
          origin: {
            latitude: 0,
            longitude: 0,
          },
          destination: {
            latitude: 1,
            longitude: 1,
          },
        }),
      },
    );

    const response = await POST(request);
    const json = await readDirectionsResponse(response);

    assert.strictEqual(json.source, "demo_network");
  });

  test("handles rate limits and falls back to demo", async () => {
    process.env.ORS_API_KEY = "valid-key";

    setFetchError(429);

    const request = new Request(
      "http://localhost/api/routes/directions",
      {
        method: "POST",
        body: JSON.stringify({
          origin: {
            latitude: 0,
            longitude: 0,
          },
          destination: {
            latitude: 1,
            longitude: 1,
          },
        }),
      },
    );

    const response = await POST(request);
    const json = await readDirectionsResponse(response);

    assert.strictEqual(json.source, "demo_network");
    assert.ok(/Live ORS request failed/.test(json.notice ?? ""));
  });

  test("handles fetch timeout and falls back to demo", async () => {
    process.env.ORS_API_KEY = "valid-key";

    setFetchReject("AbortError");

    const request = new Request(
      "http://localhost/api/routes/directions",
      {
        method: "POST",
        body: JSON.stringify({
          origin: {
            latitude: 0,
            longitude: 0,
          },
          destination: {
            latitude: 1,
            longitude: 1,
          },
        }),
      },
    );

    const response = await POST(request);
    const json = await readDirectionsResponse(response);

    assert.strictEqual(json.source, "demo_network");
    assert.ok(/Live ORS request failed/.test(json.notice ?? ""));
  });
});

// ---------------------------------------------------------------------------
// Accessibility inference edge cases
// ---------------------------------------------------------------------------

describe("Accessibility inference edge cases", () => {
  test("unknown surface does not create a confirmed surface barrier", () => {
    const defaultProfile = getDefaultProfile();

    const profile: UserAccessibilityProfile = {
      ...defaultProfile,

      mobility: {
        ...defaultProfile.mobility,
        usesWheelchair: true,
        requiresStepFreeAccess: "essential",
      },
    };

    const plan: FullRoutePlan = {
      id: "demo",
      dataSource: "demo_network",
      name: "Demo",

      origin: {
        latitude: 0,
        longitude: 0,
      },

      destination: {
        latitude: 0.001,
        longitude: 0.001,
      },

      originLabel: "A",
      destinationLabel: "B",

      coordinates: [
        [0, 0],
        [0.001, 0.001],
      ],

      distanceMeters: 100,
      durationMinutes: 1,
      steps: [],

      characteristics: {
        totalDistanceMeters: 100,
        estimatedDurationMinutes: 1,
        maxInclinePercent: 0,
        steepSegmentsPercent: 0,

        surfaceDistribution: {
          unknown: 100,
        },

        unknownSurfacePercent: 100,
        unknownInclinePercent: 100,
        hasKnownSteps: false,
        knownStepsCount: 0,
        wayTypes: [],
      },
    };

    const inference = RouteInferenceEngine.evaluate(profile, plan);

    const surfaceBarriers = inference.barriers.filter((barrier) =>
      barrier.title.toLowerCase().includes("surface"),
    );

    assert.strictEqual(surfaceBarriers.length, 0);
  });
});