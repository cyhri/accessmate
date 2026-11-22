"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoCoordinates, FullRoutePlan } from "../types";

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
}

export default function RouteMap({
  routes,
  selectedRouteIndex,
  onSelectRoute,
  originCoords,
  destinationCoords,
  originLabel,
  destinationLabel,
  onMapClick,
  tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | HeiGIT ORS',
  className = "h-[450px] sm:h-[520px] w-full",
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

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
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    // Handle map clicks
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [tileUrl, attribution, onMapClick, originCoords?.latitude, originCoords?.longitude]);

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

      const weight = isSelected ? 6 : 4;
      const opacity = isSelected ? 0.95 : 0.6;
      const dashArray = isSelected ? undefined : "6, 8";

      let routeColor = "#64748b"; // default slate for alternative

      if (isSelected) {
        const outcome = route.assessment?.overallOutcome;
        if (outcome === "suitable") routeColor = "#059669"; // emerald
        else if (outcome === "suitable_with_arrangements") routeColor = "#0d9488"; // teal
        else if (outcome === "difficult") routeColor = "#d97706"; // amber
        else if (outcome === "unsuitable") routeColor = "#e11d48"; // rose
        else routeColor = "#0d9488"; // default teal
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
        `<strong>${route.name}</strong><br/>Distance: ${route.distanceMeters}m • ~${route.durationMinutes} mins${
          route.assessment ? `<br/>Outcome: <em>${route.assessment.outcomeTitle}</em>` : ""
        }`,
        { sticky: true }
      );

      layers.addLayer(polyline);

      // Add barrier warning pins on selected route if stairs exist
      if (isSelected && route.characteristics.hasKnownSteps) {
        const stepIndex = Math.min(coords.length - 1, Math.floor(coords.length / 2));
        const barrierPos = coords[stepIndex];
        if (barrierPos) {
          const barrierIcon = L.divIcon({
            className: "custom-barrier-icon",
            html: `
              <div style="background-color: #e11d48; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;">
                ⚠
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const barrierMarker = L.marker(barrierPos, { icon: barrierIcon });
          barrierMarker.bindPopup(
            `<strong>Physical Barrier Detected</strong><br/>${route.characteristics.knownStepsCount} steps/stairs confirmed along this segment.`
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
          <div style="background-color: #0d9488; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(13,148,136,0.5); border: 2.5px solid white;">
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
          <div style="background-color: #e11d48; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(225,29,72,0.5); border: 2.5px solid white;">
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

    // Fit Bounds if geometry exists
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [routes, selectedRouteIndex, originCoords, destinationCoords, originLabel, destinationLabel, onSelectRoute]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || routes.length === 0) return;
    const bounds = L.latLngBounds([]);
    routes.forEach((r) => r.coordinates.forEach((c) => bounds.extend(c)));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-slate-100">
      <div ref={mapContainerRef} className={className} tabIndex={0} aria-label="Interactive Accessibility Map" />

      {/* Floating Map Controls & Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleFitBounds}
          className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-semibold shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer"
          aria-label="Fit map to complete route"
        >
          Fit Route
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs text-xs space-y-1.5 max-w-[220px]">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          Accessibility Legend
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-teal-600 shrink-0 inline-block" />
          <span>Origin (A)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0 inline-block" />
          <span>Destination (B)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-4 h-1 bg-teal-600 shrink-0 inline-block rounded" />
          <span>Selected Route</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-4 h-1 border-t-2 border-dashed border-slate-400 shrink-0 inline-block" />
          <span>Alternative Route</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
            ⚠
          </span>
          <span>Known Barrier / Steps</span>
        </div>
      </div>
    </div>
  );
}
