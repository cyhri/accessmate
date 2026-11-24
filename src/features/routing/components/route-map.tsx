"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import type { GeoCoordinates, FullRoutePlan } from "../types";
import { Layers, Maximize2, Box, Building2, Compass } from "lucide-react";
import {
  LANDMARK_3D_BUILDINGS,
  draw3DBuildingsLayer,
} from "./buildings-3d";

export interface RouteMapProps {
  readonly routes: readonly FullRoutePlan[];
  readonly selectedRouteIndex: number;
  readonly onSelectRoute?: (index: number) => void;
  readonly originCoords?: GeoCoordinates | null;
  readonly destinationCoords?: GeoCoordinates | null;
  readonly originLabel?: string;
  readonly destinationLabel?: string;
  readonly onMapClick?: (coords: GeoCoordinates) => void;
  readonly tileUrl?: string;
  readonly attribution?: string;
  readonly className?: string;
  readonly isNavigating?: boolean;
  readonly userPosition?: [number, number] | null;
  readonly is3DMode?: boolean;
  readonly onToggle3D?: () => void;
}

const TILE_STYLES = {
  streets: {
    name: "Streets",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    subdomains: "abc",
    attribution: '&copy; Esri &bull; Street Map',
  },
  snap: {
    name: "Snap 3D",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    subdomains: "abc",
    attribution: '&copy; OpenStreetMap &bull; HOT',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "abc",
    attribution: '&copy; Esri &bull; Satellite',
  },
  osm: {
    name: "OSM",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    attribution: '&copy; OpenStreetMap contributors',
  },
} as const;

export default function RouteMap({
  routes,
  selectedRouteIndex,
  onSelectRoute,
  originCoords,
  destinationCoords,
  originLabel,
  destinationLabel,
  onMapClick,
  className = "h-[500px] w-full",
  isNavigating = false,
  userPosition,
  is3DMode = false,
  onToggle3D,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeStyle, setActiveStyle] = useState<keyof typeof TILE_STYLES>("streets");
  const [showLegend, setShowLegend] = useState(false);
  const [show3DBuildings, setShow3DBuildings] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center (Berlin / Central Europe)
    const initialLat = originCoords?.latitude ?? 52.5208;
    const initialLng = originCoords?.longitude ?? 13.3725;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false, // Custom styled controls
      scrollWheelZoom: true,
    });

    const style = TILE_STYLES[activeStyle];
    const tileLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    // Force Leaflet to calculate container dimensions
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Handle map clicks
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        });
      }
    });

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeStyle, onMapClick, originCoords?.latitude, originCoords?.longitude]);

  // Switch basemap tile layer dynamically
  const handleChangeBasemap = (styleKey: keyof typeof TILE_STYLES) => {
    setActiveStyle(styleKey);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const style = TILE_STYLES[styleKey];
    const newLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = newLayer;
  };

  // Zoom directly into street level (18.5) and follow user in Navigation mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (isNavigating && userPosition) {
      map.setView(userPosition, 18.5, { animate: true, duration: 0.9 });
    } else if (!isNavigating && userPosition) {
      map.panTo(userPosition, { animate: true, duration: 0.8 });
    }
  }, [userPosition, isNavigating]);

  // Handle exiting navigation -> smoothly zoom back out to full route overview
  const prevNavigatingRef = useRef(isNavigating);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (prevNavigatingRef.current && !isNavigating) {
      const bounds = L.latLngBounds([]);
      routes.forEach((r) => r.coordinates.forEach((c) => bounds.extend(c)));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
    prevNavigatingRef.current = isNavigating;
  }, [isNavigating, routes]);

  // Invalidate size on 3D toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 350);
    return () => clearTimeout(timer);
  }, [is3DMode]);

  // Update Layers & Geometry on route/marker change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Draw Routes
    routes.forEach((route, index) => {
      const isSelected = index === selectedRouteIndex;
      const coords = route.coordinates;
      if (!coords || coords.length === 0) return;

      coords.forEach((c) => bounds.extend(c));

      const weight = isSelected ? 7 : 4;
      const opacity = isSelected ? 0.95 : 0.55;
      const dashArray = isSelected ? undefined : "6, 8";

      let routeColor = "#64748b";

      if (isSelected) {
        const outcome = route.assessment?.overallOutcome;
        if (outcome === "suitable") routeColor = "#0d9488"; // teal
        else if (outcome === "suitable_with_arrangements") routeColor = "#059669"; // emerald
        else if (outcome === "difficult") routeColor = "#d97706"; // amber
        else if (outcome === "unsuitable") routeColor = "#e11d48"; // rose
        else routeColor = "#0d9488";
      }

      const polyline = L.polyline(coords as unknown as L.LatLngExpression[], {
        color: routeColor,
        weight,
        opacity,
        dashArray,
      });

      polyline.on("click", () => {
        if (onSelectRoute) onSelectRoute(index);
      });

      polyline.bindTooltip(
        `<strong>${route.name}</strong><br/>${route.distanceMeters}m • ~${route.durationMinutes} mins${
          route.assessment ? `<br/><em>${route.assessment.outcomeTitle}</em>` : ""
        }`,
        { sticky: true }
      );

      layers.addLayer(polyline);

      // Add barrier warning pins on selected route
      if (isSelected && route.characteristics.hasKnownSteps) {
        const stepIndex = Math.min(coords.length - 1, Math.floor(coords.length / 2));
        const barrierPos = coords[stepIndex];
        if (barrierPos) {
          const barrierIcon = L.divIcon({
            className: "custom-barrier-icon",
            html: `
              <div style="background-color: #e11d48; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; box-shadow: 0 4px 10px rgba(225,29,72,0.5); border: 2.5px solid white;">
                !
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const barrierMarker = L.marker(barrierPos, { icon: barrierIcon });
          barrierMarker.bindPopup(
            `<strong>Physical Barrier Detected</strong><br/>${route.characteristics.knownStepsCount} steps confirmed along this corridor.`
          );
          layers.addLayer(barrierMarker);
        }
      }
    });

    // 2. Draw Origin Marker
    const oLat = originCoords?.latitude ?? (routes[0]?.origin?.latitude);
    const oLng = originCoords?.longitude ?? (routes[0]?.origin?.longitude);

    if (typeof oLat === "number" && typeof oLng === "number") {
      bounds.extend([oLat, oLng]);

      const originIcon = L.divIcon({
        className: "custom-origin-icon",
        html: `
          <div style="background-color: #0d9488; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(13,148,136,0.5); border: 2.5px solid white;">
            A
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const originMarker = L.marker([oLat, oLng], { icon: originIcon });
      originMarker.bindPopup(`<strong>Origin:</strong> ${originLabel || "Departure Point"}`);
      layers.addLayer(originMarker);
    }

    // 3. Draw Destination Marker
    const dLat = destinationCoords?.latitude ?? (routes[0]?.destination?.latitude);
    const dLng = destinationCoords?.longitude ?? (routes[0]?.destination?.longitude);

    if (typeof dLat === "number" && typeof dLng === "number") {
      bounds.extend([dLat, dLng]);

      const destIcon = L.divIcon({
        className: "custom-dest-icon",
        html: `
          <div style="background-color: #e11d48; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(225,29,72,0.5); border: 2.5px solid white;">
            B
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const destMarker = L.marker([dLat, dLng], { icon: destIcon });
      destMarker.bindPopup(`<strong>Destination:</strong> ${destinationLabel || "Arrival Point"}`);
      layers.addLayer(destMarker);
    }

    // 4. Draw Snap Map 3D Mobility User Beacon (when userPosition is provided)
    if (userPosition) {
      const userBeaconIcon = L.divIcon({
        className: "custom-user-beacon",
        html: `
          <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(13,148,136,0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: -16px; width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 24px solid rgba(13,148,136,0.4);"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #111110; color: white; display: flex; align-items: center; justify-content: center; border: 2.5px solid #14b8a6; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 15px;">
              ♿
            </div>
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });

      const userMarker = L.marker(userPosition, { icon: userBeaconIcon, zIndexOffset: 2000 });
      layers.addLayer(userMarker);
    }

    // 5. Draw 3D Landmark Extruded Buildings (verified footprints only)
    if (show3DBuildings) {
      draw3DBuildingsLayer(layers, LANDMARK_3D_BUILDINGS, is3DMode);
    }

    // Fit Bounds if geometry exists and not currently in guided navigation mode
    if (bounds.isValid() && !userPosition) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [routes, selectedRouteIndex, originCoords, destinationCoords, originLabel, destinationLabel, onSelectRoute, userPosition, show3DBuildings, is3DMode]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || routes.length === 0) return;
    const bounds = L.latLngBounds([]);
    routes.forEach((r) => r.coordinates.forEach((c) => bounds.extend(c)));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  const handleZoomStreetLevel = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const target = userPosition || (originCoords ? [
      originCoords.latitude,
      originCoords.longitude
    ] : [52.5208, 13.3725]);
    map.setView(target as [number, number], 18.5, { animate: true, duration: 0.85 });
  };

  return (
    <div className={cn("relative w-full h-full min-h-[540px] rounded-3xl overflow-hidden border border-black/[0.08] shadow-sm bg-zinc-100", className)}>
      {/* 3D Perspective Map Surface (Snap Map Tilt Effect) */}
      <div
        className="w-full h-full origin-bottom"
        style={{
          transform: is3DMode
            ? "perspective(850px) rotateX(54deg) scale(1.22)"
            : "none",
          transformOrigin: "50% 80%",
          transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div ref={mapContainerRef} className="h-full w-full" tabIndex={0} aria-label="Interactive Accessibility Map" />
      </div>

      {/* Snap Map 3D Atmosphere Horizon Gradient (Only active in 3D Mode) */}
      {is3DMode && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-400/25 via-sky-300/10 to-transparent z-[500]" />
      )}

      {/* Floating Apple/Snap Map Controls Overlay (Top-Right) */}
      <div className="absolute top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-auto">
        {/* 3D / 2D Perspective Toggle */}
        <button
          type="button"
          onClick={onToggle3D}
          className={cn(
            "px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold shadow-md border transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-1.5",
            is3DMode
              ? "bg-[#111110] text-teal-300 border-black shadow-teal-500/10"
              : "bg-white/95 text-zinc-800 border-black/[0.08] hover:bg-white"
          )}
          aria-label="Toggle 3D Snap Map perspective"
        >
          <div className="flex items-center gap-1.5">
            <Box className="h-3.5 w-3.5" />
            <span>{is3DMode ? "3D Active" : "2D"}</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono">{is3DMode ? "54°" : "0°"}</span>
        </button>

        {/* 3D Buildings Layer Toggle */}
        <button
          type="button"
          onClick={() => setShow3DBuildings((v) => !v)}
          className={cn(
            "px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold shadow-md border transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-1.5",
            show3DBuildings
              ? "bg-white/95 text-teal-800 border-teal-600/30 font-bold"
              : "bg-white/95 text-zinc-600 border-black/[0.08]"
          )}
          aria-label="Toggle 3D Extruded Buildings"
        >
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-teal-600" />
            <span>3D Buildings</span>
          </div>
          <span className={cn("text-[9px] px-1.5 py-0.2 rounded-full font-bold", show3DBuildings ? "bg-teal-100 text-teal-900" : "bg-zinc-100 text-zinc-500")}>
            {show3DBuildings ? "ON" : "OFF"}
          </span>
        </button>

        {/* Street Level Zoom vs Route Overview Quick Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomStreetLevel}
            className="flex-1 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-800 text-[11px] font-bold shadow-md border border-black/[0.08] hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Zoom down into the street at foot level"
          >
            <Compass className="h-3 w-3 text-teal-600" />
            <span>Street (18x)</span>
          </button>
          <button
            type="button"
            onClick={handleFitBounds}
            className="flex-1 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-zinc-800 text-[11px] font-bold shadow-md border border-black/[0.08] hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
            title="Zoom out to show whole route"
          >
            <Maximize2 className="h-3 w-3 text-zinc-500" />
            <span>Overview</span>
          </button>
        </div>

        {/* Basemap Switcher (Streets, Snap 3D, Satellite, OSM) */}
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-white/92 backdrop-blur-md border border-black/[0.08] shadow-md text-[10px] font-semibold">
          {(["streets", "snap", "satellite", "osm"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChangeBasemap(key)}
              className={cn(
                "px-2 py-0.5 rounded-full transition-colors cursor-pointer",
                activeStyle === key
                  ? "bg-[#111110] text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              {TILE_STYLES[key].name}
            </button>
          ))}
        </div>

        {/* Fit Bounds Button */}
        <button
          type="button"
          onClick={handleFitBounds}
          className="px-3 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-zinc-900 text-xs font-semibold shadow-md border border-black/[0.08] hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
          aria-label="Fit map to complete route"
        >
          <Maximize2 className="h-3 w-3" />
          <span>Fit Route</span>
        </button>
      </div>

      {/* Collapsible Accessibility Legend (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-[999] pointer-events-auto">
        {showLegend ? (
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-black/[0.08] shadow-xl text-[11px] space-y-2 max-w-[210px]">
            <div className="flex items-center justify-between pb-1 border-b border-black/[0.04]">
              <span className="font-semibold text-zinc-900 text-[10px] tracking-wider uppercase text-zinc-400">
                Legend
              </span>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0 inline-block ring-2 ring-teal-100" />
              <span>Origin (A)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 inline-block ring-2 ring-rose-100" />
              <span>Destination (B)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="w-3.5 h-1 bg-teal-600 shrink-0 inline-block rounded-full" />
              <span>Selected Route</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="w-3.5 h-1 border-t-2 border-dashed border-zinc-400 shrink-0 inline-block" />
              <span>Alternative</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="w-3 h-3 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                !
              </span>
              <span>Obstacle / Steps</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLegend(true)}
            className="px-3 py-1.5 rounded-full bg-white/92 backdrop-blur-md text-zinc-700 text-xs font-semibold shadow-md border border-black/[0.08] hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="h-3 w-3" />
            <span>Legend</span>
          </button>
        )}
      </div>
    </div>
  );
}
