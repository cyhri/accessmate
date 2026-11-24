import { NextResponse } from "next/server";
import type { GeoCoordinates } from "@/types/common";
import type { UserAccessibilityProfile } from "@/types/profile";
import type { FullRoutePlan, ORSGeoJSONResponse } from "@/features/routing/types";
import {
  buildORSWheelchairRestrictions,
  parseORSGeoJSONResponse,
} from "@/features/routing/ors-client";
import { RouteInferenceEngine } from "@/features/routing/engine/route-inference-engine";
import { getDemoRoutePlan } from "@/features/routing/demo-routes";
import { getDefaultProfile } from "@/lib/storage/profile-storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      profile,
      originLabel,
      destinationLabel,
      mode = "auto", // "auto" | "live" | "demo"
      allowPedestrianFallback = false,
    } = body as {
      origin?: GeoCoordinates;
      destination?: GeoCoordinates;
      profile?: UserAccessibilityProfile;
      originLabel?: string;
      destinationLabel?: string;
      mode?: "auto" | "live" | "demo";
      allowPedestrianFallback?: boolean;
    };

    // Validate Input Coordinates
    if (
      !origin ||
      typeof origin.latitude !== "number" ||
      typeof origin.longitude !== "number" ||
      !destination ||
      typeof destination.latitude !== "number" ||
      typeof destination.longitude !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates provided. Latitude and longitude numbers are required." },
        { status: 400 }
      );
    }

    if (
      origin.latitude < -90 ||
      origin.latitude > 90 ||
      destination.latitude < -90 ||
      destination.latitude > 90 ||
      origin.longitude < -180 ||
      origin.longitude > 180 ||
      destination.longitude < -180 ||
      destination.longitude > 180
    ) {
      return NextResponse.json(
        { error: "Coordinates out of bounds (-90 to 90 lat, -180 to 180 lon)." },
        { status: 400 }
      );
    }

    const safeProfile: UserAccessibilityProfile = profile ?? getDefaultProfile();
    const apiKey = process.env.ORS_API_KEY;
    const originName = originLabel || "Selected Origin";
    const destName = destinationLabel || "Selected Destination";

    const isWheelchairUser =
      safeProfile.mobility.usesWheelchair ||
      safeProfile.mobility.requiresStepFreeAccess === "essential";

    // 1. Explicit Demonstration Mode Request
    if (mode === "demo") {
      const dummyOrigin = {
        id: "orig",
        name: originName,
        label: originName,
        coordinates: origin,
      };
      const dummyDest = {
        id: "dest",
        name: destName,
        label: destName,
        coordinates: destination,
      };

      const primaryPlan = getDemoRoutePlan(dummyOrigin, dummyDest, false);
      const altPlan = getDemoRoutePlan(dummyOrigin, dummyDest, true);

      const primaryAssessment = RouteInferenceEngine.evaluate(safeProfile, primaryPlan);
      const altAssessment = RouteInferenceEngine.evaluate(safeProfile, altPlan);

      const routes: FullRoutePlan[] = [
        { ...primaryPlan, assessment: primaryAssessment },
        { ...altPlan, assessment: altAssessment },
      ];

      return NextResponse.json({
        routes,
        source: "demo_network",
        notice: "Demonstration mode active. Using synthetic accessible benchmark routes.",
      });
    }

    // 2. Live Route Calculation via OpenRouteService
    let liveErrorReason: string | null = null;
    let wheelchairBlocked = false;

    if (apiKey && apiKey.trim() && apiKey.trim() !== "your_openrouteservice_api_key_here") {
      try {
        const { options } = buildORSWheelchairRestrictions(safeProfile);
        const profileSlug = isWheelchairUser ? "wheelchair" : "foot-walking";
        let url = `https://api.openrouteservice.org/v2/directions/${profileSlug}/geojson`;

        const payload: Record<string, unknown> = {
          coordinates: [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude],
          ],
          options: isWheelchairUser ? options : undefined,
          extra_info: ["steepness", "surface", "waytype", "waycategory", "suitability"],
          alternative_routes: {
            target_count: 2,
            weight_factor: 1.4,
          },
          instructions: true,
          elevation: false,
        };

        let response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
            Accept: "application/json, application/geo+json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });

        // Check for provider authentication / quota errors
        const isAuthError = response.status === 401 || response.status === 403;
        const isRateLimit = response.status === 429;

        if (isAuthError) {
          liveErrorReason = `OpenRouteService authorization rejected (HTTP ${response.status}: Access disallowed). Please verify ORS_API_KEY.`;
        } else if (isRateLimit) {
          liveErrorReason = "OpenRouteService quota or rate limit exceeded (HTTP 429).";
        }

        // Wheelchair Routing Safety Check:
        // Only trigger wheelchairBlocked when ORS is authenticated and reachable but reports no accessible path (e.g. 404/400).
        if (!response.ok && isWheelchairUser && !isAuthError && !isRateLimit) {
          if (!allowPedestrianFallback) {
            wheelchairBlocked = true;
            liveErrorReason = "No verified wheelchair-accessible corridor could be calculated for this destination within your gradient and step tolerances.";
          } else {
            // User explicitly requested unverified pedestrian path inspection
            url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";
            response = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: apiKey,
                "Content-Type": "application/json",
                Accept: "application/json, application/geo+json",
              },
              body: JSON.stringify({
                ...payload,
                options: undefined,
              }),
              signal: AbortSignal.timeout(8000),
            });
          }
        }

        if (response.ok) {
          const geojson: ORSGeoJSONResponse = await response.json();
          if (geojson.features && geojson.features.length > 0) {
            const evaluatedRoutes: FullRoutePlan[] = [];

            for (let i = 0; i < geojson.features.length; i++) {
              const routePlan = parseORSGeoJSONResponse(
                geojson,
                originName,
                destName,
                i,
                "live_ors"
              );
              const assessment = RouteInferenceEngine.evaluate(safeProfile, routePlan);

              // If this was an unverified pedestrian fallback for a wheelchair user, tag it explicitly
              if (isWheelchairUser && allowPedestrianFallback) {
                evaluatedRoutes.push({
                  ...routePlan,
                  warningNotice: "Warning: Unverified standard pedestrian corridor with potential curbs or steps.",
                  assessment: {
                    ...assessment,
                    overallOutcome: "difficult",
                    recommendations: [
                      {
                        id: "ped-fallback-warn",
                        priority: "critical" as const,
                        title: "Unverified Pedestrian Corridor",
                        description: "This route uses standard pedestrian pathways and may contain unmapped stairs or steep curbs.",
                        category: "mobility",
                        linkedRuleId: "ROUT-WARN-01",
                      },
                      ...assessment.recommendations,
                    ],
                  },
                });
              } else {
                evaluatedRoutes.push({
                  ...routePlan,
                  assessment,
                });
              }
            }

            return NextResponse.json({
              routes: evaluatedRoutes,
              source: "live_ors",
            });
          }
        } else if (!wheelchairBlocked) {
          liveErrorReason = `OpenRouteService request failed (HTTP ${response.status}).`;
        }
      } catch (err: unknown) {
        liveErrorReason = (err as Error).message || "Live routing request timed out.";
      }
    } else {
      liveErrorReason = "OpenRouteService API key is not configured on the server.";
    }

    // 3. Strict Live Mode Handling (If caller asked for live routing)
    if (mode === "live") {
      if (wheelchairBlocked) {
        return NextResponse.json(
          {
            error: "No wheelchair-accessible route found",
            message: liveErrorReason,
            source: "wheelchair_blocked",
            canFallbackToPedestrian: true,
            demoAvailable: true,
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          error: "Live routing calculation failed",
          message: liveErrorReason,
          source: "live_failed",
          demoAvailable: true,
        },
        { status: 502 }
      );
    }

    // 4. Auto / Legacy Test Compatibility Mode:
    // Generate demonstration routes with explicit notice
    const dummyOrigin = {
      id: "orig",
      name: originName,
      label: originName,
      coordinates: origin,
    };
    const dummyDest = {
      id: "dest",
      name: destName,
      label: destName,
      coordinates: destination,
    };

    const primaryPlan = getDemoRoutePlan(dummyOrigin, dummyDest, false);
    const altPlan = getDemoRoutePlan(dummyOrigin, dummyDest, true);

    const primaryAssessment = RouteInferenceEngine.evaluate(safeProfile, primaryPlan);
    const altAssessment = RouteInferenceEngine.evaluate(safeProfile, altPlan);

    const routes: FullRoutePlan[] = [
      { ...primaryPlan, assessment: primaryAssessment },
      { ...altPlan, assessment: altAssessment },
    ];

    return NextResponse.json({
      routes,
      source: "demo_network",
      notice: apiKey
        ? `Live ORS request failed (${liveErrorReason}). Showing simulated benchmark route.`
        : "ORS_API_KEY not configured. Showing simulated wheelchair-aware pedestrian routes.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal routing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
