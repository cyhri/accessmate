import { NextResponse } from "next/server";
import type { GeocodingResult } from "@/features/routing/types";
import { DEMO_LOCATIONS } from "@/features/routing/demo-routes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim() ?? "";

  if (!text || text.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.ORS_API_KEY;

  if (apiKey && apiKey !== "your_openrouteservice_api_key_here") {
    try {
      const url = `https://api.heigit.org/pelias/v1/search?text=${encodeURIComponent(text)}&size=5`;
      const response = await fetch(url, {
        headers: {

          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const features = data.features || [];

        const results: GeocodingResult[] = features.map((f: {
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
        }, index: number) => {
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
        });

        if (results.length > 0) {
          return NextResponse.json({ results, source: "live_pelias" });
        }
      }
    } catch {
      // Fallback to local demo dataset if Pelias fails
    }
  }

  // Local demo fallback: search DEMO_LOCATIONS
  const queryLower = text.toLowerCase();
  const matched = DEMO_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(queryLower) ||
      loc.label.toLowerCase().includes(queryLower) ||
      (loc.locality && loc.locality.toLowerCase().includes(queryLower))
  );

  const results = matched.length > 0 ? matched : [
    {
      id: `synthetic-${Date.now()}`,
      name: text,
      label: `${text} (Map Selection)`,
      coordinates: { latitude: 52.5200, longitude: 13.3700 },
      locality: "City Center",
      confidence: 0.8,
    },
    ...DEMO_LOCATIONS.slice(0, 3),
  ];

  return NextResponse.json({
    results,
    source: "demo_dataset",
    notice: apiKey ? undefined : "ORS_API_KEY not set. Using demonstration location suggestions.",
  });
}
