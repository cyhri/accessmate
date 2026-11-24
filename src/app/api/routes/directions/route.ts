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
    const { origin, destination, profile, originLabel, destinationLabel } = body as {
      origin?: GeoCoordinates;
      destination?: GeoCoordinates;
      profile?: UserAccessibilityProfile;
      originLabel?: string;
      destinationLabel?: string;
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

    // Attempt live call if ORS_API_KEY is configured
    if (apiKey && apiKey.trim() && apiKey.trim() !== "your_openrouteservice_api_key_here") {
      try {
        const { options } = buildORSWheelchairRestrictions(safeProfile);
        const isWheelchairUser =
          safeProfile.mobility.usesWheelchair ||
          safeProfile.mobility.requiresStepFreeAccess === "essential";

        // Try wheelchair profile first if wheelchair user, else foot-walking
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

        // If wheelchair profile returned no routes, try foot-walking as accessible fallback
        if (!response.ok && isWheelchairUser) {
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

        if (!response.ok) {
          throw new Error(`ORS request failed with status ${response.status}`);
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
              evaluatedRoutes.push({
                ...routePlan,
                assessment,
              });
            }

            return NextResponse.json({
              routes: evaluatedRoutes,
              source: "live_ors",
            });
          }
        }
      } catch {
        // Fall back gracefully to local synthetic demo dataset on external API network failure/timeout
      }
    }

    // Demo Mode: Generate primary and alternative route
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
  {
    ...primaryPlan,
    assessment: primaryAssessment,
  },
  {
    ...altPlan,
    assessment: altAssessment,
  },
];

    return NextResponse.json({
      routes,
      source: "demo_network",
      notice: apiKey
        ? "Live ORS request failed or timed out. Demonstrating benchmark pedestrian network routes."
        : "ORS_API_KEY not configured. Showing simulated wheelchair-aware pedestrian routes.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal routing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
