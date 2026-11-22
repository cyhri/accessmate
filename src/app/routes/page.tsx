"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Navigation,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  type GeocodingResult,
  type FullRoutePlan,
  type GeoCoordinates,
  DEMO_LOCATIONS,
  getDemoRoutePlan,
  LocationSearch,
  RouteDetailsPanel,
  RouteInferenceEngine,
} from "@/features/routing";
import { profileRepository, getDefaultProfile } from "@/features/profiles";
import type { UserAccessibilityProfile } from "@/types/profile";

// Dynamically import Leaflet Map with SSR disabled
const RouteMap = dynamic(
  () => import("@/features/routing/components/route-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] sm:h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-500 text-sm gap-2 animate-pulse">
        <Navigation className="h-6 w-6 text-teal-600 animate-spin" />
        <span>Loading Interactive Leaflet Map...</span>
      </div>
    ),
  }
);

export default function RoutesPage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(() => {
    if (typeof window === "undefined") return getDefaultProfile();
    return profileRepository.getProfile() ?? getDefaultProfile();
  });

  const [origin, setOrigin] = useState<GeocodingResult | null>(DEMO_LOCATIONS[0] ?? null);
  const [destination, setDestination] = useState<GeocodingResult | null>(DEMO_LOCATIONS[1] ?? null);

  const [routes, setRoutes] = useState<FullRoutePlan[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [clickedMapCoords, setClickedMapCoords] = useState<GeoCoordinates | null>(null);

  // Sync profile changes from localStorage events
  useEffect(() => {
    const handleProfileUpdate = () => {
      const p = profileRepository.getProfile();
      if (p) setProfile(p);
    };
    window.addEventListener("accessmate:profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("accessmate:profile-updated", handleProfileUpdate);
  }, []);

  const calculateRoute = useCallback(
    async (
      orig: GeocodingResult,
      dest: GeocodingResult,
      prof: UserAccessibilityProfile
    ) => {
      setIsCalculating(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/routes/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: orig.coordinates,
            destination: dest.coordinates,
            profile: prof,
            originLabel: orig.label,
            destinationLabel: dest.label,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to calculate routes");
        }

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          setRoutes(data.routes);
          setSelectedRouteIndex(0);
        } else {
          throw new Error("No navigable routes found between these locations.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Routing calculation failed";
        setErrorMessage(msg);
        // Fall back to benchmark demo route
        const p1 = getDemoRoutePlan(orig, dest, false);
        const a1 = RouteInferenceEngine.evaluate(prof, p1);
        setRoutes([{ ...p1, assessment: a1 }]);
        setSelectedRouteIndex(0);
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  const hasMountedRef = useRef(false);

  // Compute Initial Route on first mount
  useEffect(() => {
    if (!hasMountedRef.current && origin && destination) {
      hasMountedRef.current = true;
      calculateRoute(origin, destination, profile);
    }
  }, [calculateRoute, destination, origin, profile]);

  const handleCalculateRoute = () => {
    if (origin && destination) {
      calculateRoute(origin, destination, profile);
    }
  };

  const handleSwapLocations = () => {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
    if (destination && prevOrigin) {
      calculateRoute(destination, prevOrigin, profile);
    }
  };

  const handleSelectProfile = (newProfile: UserAccessibilityProfile) => {
    setProfile(newProfile);
    if (origin && destination) {
      calculateRoute(origin, destination, newProfile);
    }
  };

  const handleMapClick = (coords: GeoCoordinates) => {
    setClickedMapCoords(coords);
  };

  const handleSetClickedAsOrigin = () => {
    if (!clickedMapCoords) return;
    const loc: GeocodingResult = {
      id: `map-click-${Date.now()}`,
      name: `Point (${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)})`,
      label: `Map Pin: ${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)}`,
      coordinates: clickedMapCoords,
      confidence: 1.0,
    };
    setOrigin(loc);
    setClickedMapCoords(null);
  };

  const handleSetClickedAsDestination = () => {
    if (!clickedMapCoords) return;
    const loc: GeocodingResult = {
      id: `map-click-${Date.now()}`,
      name: `Point (${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)})`,
      label: `Map Pin: ${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)}`,
      coordinates: clickedMapCoords,
      confidence: 1.0,
    };
    setDestination(loc);
    setClickedMapCoords(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="sm" dot>
              Phase 5 Active
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Spatial Decision-Support
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Accessibility-Aware Route Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pedestrian micro-routing evaluating slope gradients, surface roughness, curb transitions, and physical obstacles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleCalculateRoute}
            disabled={isCalculating || !origin || !destination}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Refresh Assessment
          </Button>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <Alert variant="warning">
          <AlertTitle>Routing Notice</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Map Click Action Toast */}
      {clickedMapCoords && (
        <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/90 text-teal-950 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <MapPin className="h-4 w-4 text-teal-700 shrink-0" />
            <span>
              Clicked Map Coordinate: ({clickedMapCoords.latitude.toFixed(5)}, {clickedMapCoords.longitude.toFixed(5)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetClickedAsOrigin}
              className="text-xs px-2.5 py-1 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
            >
              Set as Origin (A)
            </button>
            <button
              type="button"
              onClick={handleSetClickedAsDestination}
              className="text-xs px-2.5 py-1 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Set as Destination (B)
            </button>
            <button
              type="button"
              onClick={() => setClickedMapCoords(null)}
              className="text-xs text-slate-500 hover:text-slate-800 ml-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Search & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Parameters (4 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <LocationSearch
            origin={origin}
            destination={destination}
            onSelectOrigin={setOrigin}
            onSelectDestination={setDestination}
            onSwapLocations={handleSwapLocations}
            onCalculateRoute={handleCalculateRoute}
            isCalculating={isCalculating}
            selectedProfile={profile}
            onSelectProfile={handleSelectProfile}
          />
        </div>

        {/* Right Column: Interactive Leaflet Map (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3">
          <RouteMap
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRoute={setSelectedRouteIndex}
            originCoords={origin?.coordinates}
            destinationCoords={destination?.coordinates}
            originLabel={origin?.label}
            destinationLabel={destination?.label}
            onMapClick={handleMapClick}
          />
          <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>Tip: Click anywhere on the map to set an origin or destination pin.</span>
            <span>OpenStreetMap tiles</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Route Details & Explainable Accessibility Analysis */}
      {routes.length > 0 && (
        <div className="pt-2">
          <RouteDetailsPanel
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRoute={setSelectedRouteIndex}
            profileName={profile.name}
          />
        </div>
      )}
    </div>
  );
}
