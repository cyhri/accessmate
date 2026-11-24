"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import type { GeoCoordinates, FullRoutePlan } from "../types";
import type { CommunityReport } from "@/features/reports/types";
import { Box, Building2, Compass, Maximize2, Navigation } from "lucide-react";

// Configure MapLibre Web Worker explicitly for Next.js (Turbopack & Webpack)
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
}

export interface RouteMapLibreProps {
  readonly routes?: readonly FullRoutePlan[];
  readonly selectedRouteIndex?: number;
  readonly onSelectRoute?: (index: number) => void;
  readonly originCoords?: GeoCoordinates | null;
  readonly destinationCoords?: GeoCoordinates | null;
  readonly originLabel?: string;
  readonly destinationLabel?: string;
  readonly onMapClick?: (coords: GeoCoordinates) => void;
  readonly className?: string;
  readonly isNavigating?: boolean;
  readonly userPosition?: GeoCoordinates | null;
  readonly userHeading?: number | null;
  readonly is3DMode?: boolean;
  readonly onToggle3D?: () => void;
  readonly communityReports?: readonly CommunityReport[];
  readonly onSelectReport?: (report: CommunityReport) => void;
  readonly highlightedReportId?: string | null;
  readonly pickerCoords?: GeoCoordinates | null;
  readonly onPickerCoordsChange?: (coords: GeoCoordinates) => void;
}

const VECTOR_STYLES = {
  liberty: {
    name: "3D City",
    url: "https://tiles.openfreemap.org/styles/liberty",
  },
  positron: {
    name: "Clean Light",
    url: "https://tiles.openfreemap.org/styles/positron",
  },
  bright: {
    name: "Bright",
    url: "https://tiles.openfreemap.org/styles/bright",
  },
} as const;

/**
 * Configures the real MapLibre 3D fill-extrusion building layer using vector tile metadata.
 */
function configureBuilding3DLayer(map: maplibregl.Map, show3D: boolean): void {
  try {
    const style = map.getStyle();
    if (!style || !style.layers) return;

    // 1. Check if building-3d layer already exists in OpenFreeMap style
    const existing3D = map.getLayer("building-3d");
    if (existing3D) {
      map.setLayoutProperty("building-3d", "visibility", show3D ? "visible" : "none");
      map.setPaintProperty("building-3d", "fill-extrusion-opacity", show3D ? 0.35 : 0);
      return;
    }

    // 2. Check if custom 3d-buildings-extrusion layer already exists
    const existingExtrusion = map.getLayer("3d-buildings-extrusion");
    if (existingExtrusion) {
      map.setLayoutProperty("3d-buildings-extrusion", "visibility", show3D ? "visible" : "none");
      map.setPaintProperty("3d-buildings-extrusion", "fill-extrusion-opacity", show3D ? 0.35 : 0);
      return;
    }

    // 3. If neither exists, add real OpenMapTiles 3D fill-extrusion layer
    if (map.getSource("openmaptiles") && !map.getLayer("3d-buildings-extrusion")) {
      map.addLayer({
        id: "3d-buildings-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        filter: ["!=", ["get", "hide_3d"], true],
        layout: {
          visibility: show3D ? "visible" : "none",
        },
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "render_height"], ["get", "height"], 15],
            0,
            "hsl(215, 20%, 90%)",
            25,
            "hsl(215, 25%, 84%)",
            60,
            "hsl(215, 30%, 76%)",
            120,
            "hsl(215, 35%, 68%)",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            15.5,
            ["coalesce", ["get", "render_height"], ["get", "height"], 12],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            15.5,
            ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
          ],
          "fill-extrusion-opacity": 0.35,
        },
      });
    }
  } catch (err) {
    // Ignore layer config race conditions gracefully
    console.debug("Building layer configuration notice:", err);
  }
}

export default function RouteMapLibre({
  routes = [],
  selectedRouteIndex = 0,
  originCoords,
  destinationCoords,
  originLabel,
  destinationLabel,
  onMapClick,
  className = "h-[500px] w-full",
  isNavigating = false,
  userPosition,
  userHeading,
  is3DMode = true,
  onToggle3D,
  communityReports = [],
  onSelectReport,
  highlightedReportId,
  pickerCoords,
  onPickerCoordsChange,
}: RouteMapLibreProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const onPickerCoordsChangeRef = useRef(onPickerCoordsChange);
  const onSelectReportRef = useRef(onSelectReport);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    onPickerCoordsChangeRef.current = onPickerCoordsChange;
  }, [onPickerCoordsChange]);

  useEffect(() => {
    onSelectReportRef.current = onSelectReport;
  }, [onSelectReport]);

  const [activeStyle, setActiveStyle] = useState<keyof typeof VECTOR_STYLES>("liberty");
  const [show3DBuildings, setShow3DBuildings] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Markers
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const communityMarkersRef = useRef<maplibregl.Marker[]>([]);
  const pickerMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialLng =
      originCoords?.longitude ??
      pickerCoords?.longitude ??
      communityReports[0]?.coordinates?.longitude ??
      13.3694;
    const initialLat =
      originCoords?.latitude ??
      pickerCoords?.latitude ??
      communityReports[0]?.coordinates?.latitude ??
      52.5251;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTOR_STYLES[activeStyle].url,
      center: [initialLng, initialLat],
      zoom: 14,
      pitch: is3DMode ? 56 : 0,
      bearing: 0,
      attributionControl: {
        compact: true,
        customAttribution: "OpenFreeMap &bull; OpenStreetMap contributors &bull; OpenRouteService",
      },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
      configureBuilding3DLayer(map, true);
    });

    map.on("click", (e: maplibregl.MapMouseEvent) => {
      const coords = {
        latitude: Number(e.lngLat.lat.toFixed(6)),
        longitude: Number(e.lngLat.lng.toFixed(6)),
      };
      if (onPickerCoordsChangeRef.current) {
        onPickerCoordsChangeRef.current(coords);
      }
      if (onMapClickRef.current) {
        onMapClickRef.current(coords);
      }
    });

    mapRef.current = map;

    return () => {
      communityMarkersRef.current.forEach((m) => m.remove());
      communityMarkersRef.current = [];
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
        pickerMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch Vector Styles
  const handleChangeStyle = (styleKey: keyof typeof VECTOR_STYLES) => {
    setActiveStyle(styleKey);
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(VECTOR_STYLES[styleKey].url);
    map.once("style.load", () => {
      configureBuilding3DLayer(map, show3DBuildings);
      updateRouteLayers(map);
    });
  };

  // Toggle 3D Camera Pitch
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    map.easeTo({
      pitch: is3DMode ? 56 : 0,
      duration: 700,
    });
  }, [is3DMode, mapLoaded]);

  // Toggle 3D Buildings
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    configureBuilding3DLayer(map, show3DBuildings);
  }, [show3DBuildings, mapLoaded]);

  // Update Route GeoJSON Layers
  const updateRouteLayers = useCallback((map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;

    // Convert routes to GeoJSON LineStrings [longitude, latitude]
    const primaryRoute = routes[selectedRouteIndex];

    const primaryGeoJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
      type: "FeatureCollection",
      features: primaryRoute && primaryRoute.coordinates.length > 0
        ? [
            {
              type: "Feature",
              properties: {
                id: primaryRoute.id,
                name: primaryRoute.name,
                outcome: primaryRoute.assessment?.overallOutcome ?? "suitable",
              },
              geometry: {
                type: "LineString",
                // Convert [lat, lon] tuples to GeoJSON [lon, lat]
                coordinates: primaryRoute.coordinates.map(([lat, lon]) => [lon, lat]),
              },
            },
          ]
        : [],
    };

    const altGeoJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
      type: "FeatureCollection",
      features: routes
        .filter((_, idx) => idx !== selectedRouteIndex)
        .map((r) => ({
          type: "Feature",
          properties: { id: r.id, name: r.name },
          geometry: {
            type: "LineString",
            coordinates: r.coordinates.map(([lat, lon]) => [lon, lat]),
          },
        })),
    };

    // Primary Route Source
    const primarySource = map.getSource("primary-route-source") as maplibregl.GeoJSONSource | undefined;
    if (primarySource) {
      primarySource.setData(primaryGeoJSON);
    } else {
      map.addSource("primary-route-source", {
        type: "geojson",
        data: primaryGeoJSON,
      });

      // Casing layer for visual contrast
      if (!map.getLayer("primary-route-casing")) {
        map.addLayer({
          id: "primary-route-casing",
          type: "line",
          source: "primary-route-source",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#0f766e",
            "line-width": 8,
            "line-opacity": 0.85,
          },
        });
      }

      // Core route line
      if (!map.getLayer("primary-route-line")) {
        map.addLayer({
          id: "primary-route-line",
          type: "line",
          source: "primary-route-source",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": [
              "match",
              ["get", "outcome"],
              "suitable",
              "#14b8a6",
              "suitable_with_arrangements",
              "#10b981",
              "difficult",
              "#f59e0b",
              "unsuitable",
              "#f43f5e",
              "#14b8a6",
            ],
            "line-width": 5.5,
            "line-opacity": 0.98,
          },
        });
      }
    }

    // Alternative Route Source
    const altSource = map.getSource("alt-route-source") as maplibregl.GeoJSONSource | undefined;
    if (altSource) {
      altSource.setData(altGeoJSON);
    } else {
      map.addSource("alt-route-source", {
        type: "geojson",
        data: altGeoJSON,
      });

      if (!map.getLayer("alt-route-line")) {
        map.addLayer({
          id: "alt-route-line",
          type: "line",
          source: "alt-route-source",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#64748b",
            "line-width": 4,
            "line-dasharray": [2, 2],
            "line-opacity": 0.65,
          },
        });
      }
    }
  }, [routes, selectedRouteIndex]);

  // Synchronize Routes and Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    updateRouteLayers(map);

    // 1. Origin Marker
    const oLng = originCoords?.longitude ?? routes[0]?.origin?.longitude;
    const oLat = originCoords?.latitude ?? routes[0]?.origin?.latitude;

    if (typeof oLng === "number" && typeof oLat === "number") {
      if (!originMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs shadow-lg border-2 border-white ring-2 ring-teal-500/30 cursor-pointer";
        el.innerText = "A";
        el.title = originLabel || "Starting Point";
        originMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([oLng, oLat]).addTo(map);
      } else {
        originMarkerRef.current.setLngLat([oLng, oLat]);
      }
    }

    // 2. Destination Marker
    const dLng = destinationCoords?.longitude ?? routes[0]?.destination?.longitude;
    const dLat = destinationCoords?.latitude ?? routes[0]?.destination?.latitude;

    if (typeof dLng === "number" && typeof dLat === "number") {
      if (!destMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-xs shadow-lg border-2 border-white ring-2 ring-rose-500/30 cursor-pointer";
        el.innerText = "B";
        el.title = destinationLabel || "Arrival Point";
        destMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([dLng, dLat]).addTo(map);
      } else {
        destMarkerRef.current.setLngLat([dLng, dLat]);
      }
    }

    // Fit Bounds initially if not currently navigating
    if (!isNavigating && routes.length > 0) {
      const active = routes[selectedRouteIndex];
      if (active && active.coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        active.coordinates.forEach(([lat, lon]) => bounds.extend([lon, lat]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 16.5, duration: 800 });
      }
    } else if (!isNavigating && routes.length === 0 && communityReports.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      communityReports.forEach((r) => bounds.extend([r.coordinates.longitude, r.coordinates.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
    }
  }, [routes, selectedRouteIndex, originCoords, destinationCoords, originLabel, destinationLabel, mapLoaded, isNavigating, updateRouteLayers, communityReports]);

  // Live GPS User Beacon Tracking & Camera Following
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!userPosition) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    const { latitude, longitude } = userPosition;

    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center pointer-events-none";
      el.style.width = "48px";
      el.style.height = "48px";

      el.innerHTML = `
        <div class="absolute h-10 w-10 rounded-full bg-teal-500/30 animate-ping"></div>
        <div id="user-heading-beam" class="absolute -top-3 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[18px] border-b-teal-500/60 transition-transform"></div>
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#111110] text-teal-300 font-bold text-xs shadow-2xl border-2 border-teal-400">
          ♿
        </div>
      `;

      userMarkerElementRef.current = el;
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([longitude, latitude]);
    }

    // Update Heading Beam rotation
    if (typeof userHeading === "number" && userMarkerElementRef.current) {
      const beam = userMarkerElementRef.current.querySelector("#user-heading-beam") as HTMLElement | null;
      if (beam) {
        beam.style.transform = `rotate(${userHeading}deg)`;
      }
    }

    // Street-Level Camera Following during Active Navigation
    if (isNavigating) {
      map.easeTo({
        center: [longitude, latitude],
        zoom: 18.5,
        pitch: 60,
        bearing: typeof userHeading === "number" ? userHeading : map.getBearing(),
        duration: 900,
      });
    }
  }, [userPosition, userHeading, isNavigating, mapLoaded]);

  // Synchronize Community Hazard Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove existing community markers
    communityMarkersRef.current.forEach((marker) => marker.remove());
    communityMarkersRef.current = [];

    if (!communityReports || communityReports.length === 0) return;

    communityReports.forEach((report) => {
      const { latitude, longitude } = report.coordinates;
      if (typeof latitude !== "number" || typeof longitude !== "number") return;

      const isCritical = report.severity === "critical";
      const isResolved = report.severity === "resolved";
      const isHighlighted = highlightedReportId === report.id;

      const el = document.createElement("div");
      el.className = "cursor-pointer group relative flex items-center justify-center";
      el.style.width = isHighlighted ? "46px" : "38px";
      el.style.height = isHighlighted ? "46px" : "38px";

      let bgClass = "bg-amber-500 border-white text-white";
      let pingBg = "bg-amber-400/40";
      let icon = "⚠️";

      if (isCritical) {
        bgClass = "bg-rose-600 border-white text-white";
        pingBg = "bg-rose-500/40";
        icon = "🚨";
      } else if (isResolved) {
        bgClass = "bg-emerald-600 border-white text-white";
        pingBg = "bg-transparent";
        icon = "✓";
      } else if (report.category === "elevator") {
        bgClass = "bg-indigo-600 border-white text-white";
        pingBg = "bg-indigo-400/30";
        icon = "🛗";
      } else if (report.category === "construction") {
        bgClass = "bg-amber-600 border-white text-white";
        pingBg = "bg-amber-400/30";
        icon = "🚧";
      }

      el.innerHTML = `
        ${!isResolved || isHighlighted ? `<div class="absolute inset-0 rounded-full ${pingBg} animate-ping"></div>` : ""}
        <div class="relative flex ${isHighlighted ? "h-10 w-10 ring-4 ring-amber-400 scale-110" : "h-8 w-8 ring-2 ring-black/10"} items-center justify-center rounded-full ${bgClass} font-bold text-xs shadow-lg border-2 transition-transform hover:scale-110">
          <span>${icon}</span>
        </div>
      `;

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 260px; color: #111;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 9999px; background: ${isCritical ? "#ffe4e6" : isResolved ? "#dcfce7" : "#fef3c7"}; color: ${isCritical ? "#9f1239" : isResolved ? "#166534" : "#92400e"};">
              ${isCritical ? "Critical Barrier" : isResolved ? "Resolved" : "Active Hazard"}
            </span>
            <span style="font-size: 10px; color: #71717a; font-family: monospace;">${report.timeAgo}</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; line-height: 1.3; color: #09090b;">${report.title}</div>
          <div style="font-size: 11px; color: #71717a; margin-top: 2px;">📍 ${report.location}</div>
          <div style="font-size: 11px; color: #3f3f46; margin-top: 5px; line-height: 1.4;">${report.details}</div>
          <div style="font-size: 10px; color: #065f46; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 4px 6px; margin-top: 6px;">
            <strong>Detour:</strong> ${report.routeImpact}
          </div>
          <div style="font-size: 10px; color: #71717a; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span>👥 ${report.confirmationCount} peer confirmations</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => {
        if (onSelectReportRef.current) {
          onSelectReportRef.current(report);
        }
      });

      communityMarkersRef.current.push(marker);
    });
  }, [communityReports, highlightedReportId, mapLoaded]);

  // Synchronize Location Picker Pin Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!pickerCoords) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
        pickerMarkerRef.current = null;
      }
      return;
    }

    const { latitude, longitude } = pickerCoords;

    if (!pickerMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "cursor-pointer relative flex items-center justify-center pointer-events-auto";
      el.style.width = "48px";
      el.style.height = "48px";

      el.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-teal-500/30 animate-ping"></div>
        <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-sm shadow-2xl border-2 border-white ring-4 ring-teal-500/40">
          📍
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        if (lngLat && onPickerCoordsChangeRef.current) {
          onPickerCoordsChangeRef.current({
            latitude: Number(lngLat.lat.toFixed(6)),
            longitude: Number(lngLat.lng.toFixed(6)),
          });
        }
      });

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLngLat([longitude, latitude]);
    }
  }, [pickerCoords, mapLoaded]);

  // Fly to highlighted report when selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !highlightedReportId || !communityReports) return;

    const target = communityReports.find((r) => r.id === highlightedReportId);
    if (target) {
      map.flyTo({
        center: [target.coordinates.longitude, target.coordinates.latitude],
        zoom: 17,
        pitch: is3DMode ? 50 : 0,
        duration: 800,
      });
    }
  }, [highlightedReportId, communityReports, mapLoaded, is3DMode]);

  // Fit Bounds Action
  const handleFitBounds = () => {
    const map = mapRef.current;
    if (!map) return;
    if (routes.length > 0) {
      const active = routes[selectedRouteIndex];
      if (active && active.coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        active.coordinates.forEach(([lat, lon]) => bounds.extend([lon, lat]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 16, pitch: is3DMode ? 45 : 0, duration: 800 });
      }
    } else if (communityReports && communityReports.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      communityReports.forEach((r) => bounds.extend([r.coordinates.longitude, r.coordinates.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, pitch: is3DMode ? 45 : 0, duration: 800 });
    }
  };

  // Quick Street Level Zoom
  const handleZoomStreetLevel = () => {
    const map = mapRef.current;
    if (!map) return;
    const targetLng = userPosition?.longitude ?? originCoords?.longitude ?? 13.3694;
    const targetLat = userPosition?.latitude ?? originCoords?.latitude ?? 52.5251;
    map.flyTo({
      center: [targetLng, targetLat],
      zoom: 18.5,
      pitch: 58,
      duration: 1000,
    });
  };

  // Reset North Orientation
  const handleResetNorth = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ bearing: 0, duration: 500 });
  };

  return (
    <div className={cn("relative w-full h-full min-h-[540px] rounded-3xl overflow-hidden border border-black/[0.08] shadow-sm bg-zinc-100", className)}>
      <div ref={mapContainerRef} className="h-full w-full" aria-label="3D Vector Accessibility Map" />

      {/* Snap Map Atmosphere Sky Horizon (Only in 3D Mode) */}
      {is3DMode && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-400/20 via-sky-300/5 to-transparent z-[10]" />
      )}

      {/* Floating Controls Overlay (Top-Right) */}
      <div className="absolute top-4 right-4 z-[20] flex flex-col gap-2 pointer-events-auto select-none">
        {/* 3D / 2D Perspective Toggle */}
        <button
          type="button"
          onClick={onToggle3D}
          className={cn(
            "px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold shadow-md border transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2",
            is3DMode
              ? "bg-[#111110] text-teal-300 border-black shadow-teal-500/10"
              : "bg-white/95 text-zinc-800 border-black/[0.08] hover:bg-white"
          )}
          aria-label="Toggle 3D Snap Map perspective"
        >
          <div className="flex items-center gap-1.5">
            <Box className="h-3.5 w-3.5" />
            <span>{is3DMode ? "3D Mode" : "2D Flat"}</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono">{is3DMode ? "56°" : "0°"}</span>
        </button>

        {/* 3D Buildings Extrusions Toggle */}
        <button
          type="button"
          onClick={() => setShow3DBuildings((v) => !v)}
          className={cn(
            "px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold shadow-md border transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2",
            show3DBuildings
              ? "bg-white/95 text-teal-800 border-teal-600/30 font-bold"
              : "bg-white/95 text-zinc-600 border-black/[0.08]"
          )}
          aria-label="Toggle 3D Buildings"
        >
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-teal-600" />
            <span>3D Buildings</span>
          </div>
          <span className={cn("text-[9px] px-1.5 py-0.2 rounded-full font-bold", show3DBuildings ? "bg-teal-100 text-teal-900" : "bg-zinc-100 text-zinc-500")}>
            {show3DBuildings ? "ON" : "OFF"}
          </span>
        </button>

        {/* Quick Zoom Actions: Street View vs Overview */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomStreetLevel}
            className="flex-1 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-800 text-[11px] font-bold shadow-md border border-black/[0.08] hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Zoom down into the street"
          >
            <Compass className="h-3 w-3 text-teal-600" />
            <span>Street (18x)</span>
          </button>
          <button
            type="button"
            onClick={handleFitBounds}
            className="flex-1 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-800 text-[11px] font-bold shadow-md border border-black/[0.08] hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Fit complete route"
          >
            <Maximize2 className="h-3 w-3 text-zinc-500" />
            <span>Overview</span>
          </button>
        </div>

        {/* Vector Style Switcher (3D City / Light / Bright) */}
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-white/92 backdrop-blur-md border border-black/[0.08] shadow-md text-[10px] font-semibold">
          {(["liberty", "positron", "bright"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChangeStyle(key)}
              className={cn(
                "px-2 py-0.5 rounded-full transition-colors cursor-pointer",
                activeStyle === key
                  ? "bg-[#111110] text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              {VECTOR_STYLES[key].name}
            </button>
          ))}
        </div>

        {/* Compass / Reset North */}
        <button
          type="button"
          onClick={handleResetNorth}
          className="px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md text-zinc-600 hover:text-zinc-900 text-[10px] font-medium shadow-xs border border-black/[0.06] flex items-center justify-center gap-1 cursor-pointer"
          title="Reset Map to North"
        >
          <Navigation className="h-3 w-3 rotate-45 text-rose-500" />
          <span>Reset North</span>
        </button>
      </div>
    </div>
  );
}
