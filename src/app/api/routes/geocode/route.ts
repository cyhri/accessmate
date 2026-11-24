import { NextResponse } from "next/server";
import type { GeocodingResult } from "@/features/routing/types";
import { DEMO_LOCATIONS } from "@/features/routing/demo-routes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim() ?? "";
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const apiKey = process.env.ORS_API_KEY;

  // 1. Reverse Geocoding support (when lat and lon are provided)
  if (latStr && lonStr) {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (!isNaN(lat) && !isNaN(lon)) {
      if (apiKey && apiKey !== "your_openrouteservice_api_key_here") {
        try {
          const revUrl = `https://api.openrouteservice.org/geocode/reverse?point.lat=${lat}&point.lon=${lon}&size=1`;
          const revRes = await fetch(revUrl, {
            headers: {
              Authorization: apiKey,
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(5000),
          });

          if (revRes.ok) {
            const data = await revRes.json();
            const feat = data.features?.[0];
            if (feat) {
              const label =
                feat.properties?.label ??
                feat.properties?.name ??
                `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
              const name =
                feat.properties?.name ??
                feat.properties?.street ??
                `Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

              return NextResponse.json({
                result: {
                  id: feat.id ?? `rev-${Date.now()}`,
                  label,
                  name,
                  coordinates: { latitude: lat, longitude: lon },
                  locality: feat.properties?.locality,
                  country: feat.properties?.country,
                },
                source: "live_pelias_reverse",
              });
            }
          }
        } catch {
          // Fall back gracefully to formatted coordinates
        }
      }

      return NextResponse.json({
        result: {
          id: `rev-${Date.now()}`,
          label: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          name: `Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          coordinates: { latitude: lat, longitude: lon },
        },
        source: "coordinate_format",
      });
    }
  }

  // 2. Forward Geocoding Text Search
  if (!text || text.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (apiKey && apiKey !== "your_openrouteservice_api_key_here") {
    try {
      const url = `https://api.openrouteservice.org/geocode/search?text=${encodeURIComponent(text)}&size=5`;
      const response = await fetch(url, {
        headers: {
          Authorization: apiKey,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const features = data.features || [];

        const results: GeocodingResult[] = features.map(
          (
            f: {
              id?: string;
              properties?: {
                label?: string;
                name?: string;
                locality?: string;
                country?: string;
                postalcode?: string;
                confidence?: number;
              };
              geometry?: { coordinates?: [number, number] };
            },
            index: number
          ) => {
            const coords = f.geometry?.coordinates ?? [0, 0];
            return {
              id: f.id ?? `pelias-${index}-${Date.now()}`,
              label: f.properties?.label ?? f.properties?.name ?? text,
              name: f.properties?.name ?? text,
              coordinates: {
                latitude: coords[1],
                longitude: coords[0],
              },
              locality: f.properties?.locality,
              country: f.properties?.country,
              postalCode: f.properties?.postalcode,
              confidence: f.properties?.confidence,
            };
          }
        );

        if (results.length > 0) {
          return NextResponse.json({ results, source: "live_pelias" });
        }
      }
    } catch {
      // Fallback only to known catalog demo locations if offline or query matches
    }
  }

  // Search against curated demonstration locations ONLY if text explicitly matches
  const queryLower = text.toLowerCase();
  const matched = DEMO_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(queryLower) ||
      loc.label.toLowerCase().includes(queryLower) ||
      (loc.locality && loc.locality.toLowerCase().includes(queryLower))
  );

  // If no match found, NEVER invent fake Berlin coordinates!
  return NextResponse.json({
    results: matched,
    source: matched.length > 0 ? "demo_dataset" : "none",
    notice:
      matched.length === 0
        ? "No matching locations found. You can select a point directly on the 3D map."
        : undefined,
  });
}
