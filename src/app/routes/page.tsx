"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  RotateCcw,
  MapPin,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Compass,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  Radio,
  AlertCircle,
} from "lucide-react";
import {
  type GeocodingResult,
  type FullRoutePlan,
  type GeoCoordinates,
  DEMO_LOCATIONS,
  getDemoRoutePlan,
  LocationSearch,
  RouteDetailsPanel,
  RouteInferenceEngine,
  findNearestPointOnRoute,
  calculateRemainingRouteDistanceMeters,
} from "@/features/routing";
import { profileRepository, getDefaultProfile } from "@/features/profiles";
import {
  type CommunityReport,
  type HazardProximityAlert,
  INITIAL_COMMUNITY_REPORTS,
  reportsRepository,
  checkHazardProximity,
} from "@/features/reports";
import type { UserAccessibilityProfile } from "@/types/profile";
import { cn } from "@/lib/utils";

// Dynamically import MapLibre 3D Vector Map with SSR disabled
const RouteMapLibre = dynamic(
  () => import("@/features/routing/components/route-maplibre"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[580px] sm:h-[640px] lg:h-[700px] w-full rounded-3xl border border-black/[0.08] bg-zinc-100 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2 animate-pulse">
        <Navigation className="h-5 w-5 text-teal-700 animate-spin" />
        <span className="text-xs font-semibold text-zinc-700">Loading MapLibre 3D Vector Canvas...</span>
        <span className="text-[11px] text-zinc-400">OpenFreeMap vector tiles &bull; 3D Building Extrusions</span>
      </div>
    ),
  }
);

export default function RoutesPage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(getDefaultProfile);

  const [origin, setOrigin] = useState<GeocodingResult | null>(DEMO_LOCATIONS[0] ?? null);
  const [destination, setDestination] = useState<GeocodingResult | null>(DEMO_LOCATIONS[1] ?? null);

  const [routes, setRoutes] = useState<FullRoutePlan[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clickedMapCoords, setClickedMapCoords] = useState<GeoCoordinates | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(true);

  // Live vs Demo mode state
  const [isLiveRoute, setIsLiveRoute] = useState(false);

  // 3D Perspective & Navigation States
  const [is3DMode, setIs3DMode] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  // Live GPS Tracking & Dynamic Rerouting States
  const [liveGpsPosition, setLiveGpsPosition] = useState<GeoCoordinates | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsHeading, setGpsHeading] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState<number | null>(null);
  const [remainingDurationMinutes, setRemainingDurationMinutes] = useState<number | null>(null);

  const gpsWatchIdRef = useRef<number | null>(null);
  const consecutiveOffRouteRef = useRef<number>(0);
  const lastRerouteTimestampRef = useRef<number>(0);

  // Community Reports & Live Proximity Hazard Alerting
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(() => [...INITIAL_COMMUNITY_REPORTS]);
  const [activeProximityAlert, setActiveProximityAlert] = useState<HazardProximityAlert | null>(null);
  const [highlightedHazardId, setHighlightedHazardId] = useState<string | null>(null);
  const recentHazardAlertsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleReportsUpdate = () => {
      setCommunityReports(reportsRepository.getReports());
    };
    handleReportsUpdate();
    window.addEventListener("accessmate:reports-updated", handleReportsUpdate);
    return () => window.removeEventListener("accessmate:reports-updated", handleReportsUpdate);
  }, []);

  // Sync profile changes from localStorage events and on client mount
  useEffect(() => {
    const handleProfileUpdate = () => {
      const p = profileRepository.getProfile();
      if (p) setProfile(p);
    };
    handleProfileUpdate();
    window.addEventListener("accessmate:profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("accessmate:profile-updated", handleProfileUpdate);
  }, []);

  // Web Speech API Announcement
  const speakInstruction = useCallback(
    (text: string) => {
      if (isVoiceMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore speech synthesis errors gracefully
      }
    },
    [isVoiceMuted]
  );

  // Cleanup GPS watch on unmount
  useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    };
  }, []);

  // Main Route Calculation
  const calculateRoute = useCallback(
    async (
      orig: GeocodingResult,
      dest: GeocodingResult,
      prof: UserAccessibilityProfile
    ) => {
      setIsCalculating(true);
      setErrorMessage(null);
      setGpsError(null);
      setActiveStepIndex(0);
      setRemainingDistanceMeters(null);
      setRemainingDurationMinutes(null);

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
          setIsLiveRoute(data.source === "live_ors");

          if (data.source !== "live_ors" && data.notice) {
            setErrorMessage(data.notice);
          }
        } else {
          throw new Error("No navigable pedestrian routes found between these locations.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Routing calculation failed";
        setErrorMessage(msg);
        // Honest separation: do NOT silently pretend demo is real!
        setRoutes([]);
        setIsLiveRoute(false);
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  // Explicit Fallback: Load Demonstration Benchmark Route
  const handleLoadDemoRoute = useCallback(() => {
    if (!origin || !destination) return;
    const p1 = getDemoRoutePlan(origin, destination, false);
    const p2 = getDemoRoutePlan(origin, destination, true);
    const a1 = RouteInferenceEngine.evaluate(profile, p1);
    const a2 = RouteInferenceEngine.evaluate(profile, p2);

    setRoutes([
      { ...p1, assessment: a1 },
      { ...p2, assessment: a2 },
    ]);
    setSelectedRouteIndex(0);
    setIsLiveRoute(false);
    setErrorMessage("Demonstration Mode active: Displaying benchmark pedestrian network routes.");
  }, [origin, destination, profile]);

  const hasMountedRef = useRef(false);

  // Compute initial route on mount
  useEffect(() => {
    if (!hasMountedRef.current && origin && destination) {
      hasMountedRef.current = true;
      calculateRoute(origin, destination, profile);
    }
  }, [calculateRoute, destination, origin, profile]);

  const activeRoute = routes[selectedRouteIndex];
  const steps = useMemo(() => activeRoute?.steps ?? [], [activeRoute]);
  const activeStep = steps[activeStepIndex] ?? steps[0];

  // GPS Position Update & Real-Time Rerouting Handler
  const handleGpsLocationUpdate = useCallback(
    (userCoords: GeoCoordinates, accuracy: number) => {
      if (!activeRoute || activeRoute.coordinates.length < 2) return;

      // 1. Calculate nearest point on actual route LineString geometry
      const nearest = findNearestPointOnRoute(userCoords, activeRoute.coordinates, 35);

      // 2. Calculate remaining walking distance along actual route geometry
      const remMeters = calculateRemainingRouteDistanceMeters(activeRoute.coordinates, nearest);
      setRemainingDistanceMeters(remMeters);

      // Dynamic arrival estimate based on 1.1 m/s accessible walking speed
      const remMinutes = Math.max(1, Math.round(remMeters / (1.1 * 60)));
      setRemainingDurationMinutes(remMinutes);

      // 3. Off-Route Detection: user must deviate beyond 35m and beyond GPS accuracy radius
      const offRouteThreshold = Math.max(35, Math.min(accuracy, 60));
      if (nearest.distanceMeters > offRouteThreshold) {
        consecutiveOffRouteRef.current += 1;

        const now = Date.now();
        // Require 2 consecutive off-route readings and at least 15s cooldown to prevent flapping
        if (
          consecutiveOffRouteRef.current >= 2 &&
          now - lastRerouteTimestampRef.current > 15000 &&
          destination
        ) {
          consecutiveOffRouteRef.current = 0;
          lastRerouteTimestampRef.current = now;
          setIsRerouting(true);
          speakInstruction("Off route. Recalculating accessible route from your current position.");

          const rerouteOrigin: GeocodingResult = {
            id: `gps-reroute-${now}`,
            name: "Current Location",
            label: `Current GPS (${userCoords.latitude.toFixed(4)}, ${userCoords.longitude.toFixed(4)})`,
            coordinates: userCoords,
            confidence: 1.0,
          };
          setOrigin(rerouteOrigin);

          calculateRoute(rerouteOrigin, destination, profile).finally(() => {
            setIsRerouting(false);
          });
        }
      } else {
        // User is reliably on the planned route
        consecutiveOffRouteRef.current = 0;

        // Auto-advance turn-by-turn steps when reaching next waypoint milestone
        if (steps.length > 0) {
          const cur = steps[activeStepIndex];
          if (cur && cur.wayPoints && cur.wayPoints.length > 1) {
            const stepEndWaypoint = cur.wayPoints[1];
            if (nearest.segmentIndex >= stepEndWaypoint && activeStepIndex < steps.length - 1) {
              const nextIdx = activeStepIndex + 1;
              setActiveStepIndex(nextIdx);
              if (steps[nextIdx]) {
                speakInstruction(steps[nextIdx].instruction);
              }
            }
          }
        }
      }

      // 4. Proximity Hazard Alerting: Alert when within 50m of an active community obstacle
      const hazardAlert = checkHazardProximity(
        userCoords,
        communityReports,
        50,
        recentHazardAlertsRef.current
      );
      if (hazardAlert) {
        recentHazardAlertsRef.current[hazardAlert.report.id] = Date.now();
        setActiveProximityAlert(hazardAlert);
        setHighlightedHazardId(hazardAlert.report.id);
        speakInstruction(
          `Caution: Community hazard ahead. ${hazardAlert.report.title}. ${hazardAlert.report.routeImpact}`
        );
      }
    },
    [activeRoute, activeStepIndex, calculateRoute, destination, profile, speakInstruction, steps, communityReports]
  );

  // Start Navigation Action (Live GPS vs Simulated Walkthrough)
  const handleStartNavigation = () => {
    setIsNavigating(true);
    setIs3DMode(true);
    setShowSearchPanel(false);
    setActiveStepIndex(0);

    if (isLiveRoute) {
      // Connect to genuine browser Geolocation watchPosition
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setGpsError("Geolocation is not supported by your browser.");
        return;
      }

      setGpsError(null);
      speakInstruction(
        `Starting live accessible navigation to ${destination?.name || "destination"}. ${steps[0]?.instruction || ""}`
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userCoords: GeoCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLiveGpsPosition(userCoords);
          setGpsAccuracy(Math.round(position.coords.accuracy));

          if (
            typeof position.coords.heading === "number" &&
            !Number.isNaN(position.coords.heading) &&
            position.coords.heading >= 0
          ) {
            setGpsHeading(position.coords.heading);
          }

          handleGpsLocationUpdate(userCoords, position.coords.accuracy);
        },
        (error) => {
          console.warn("GPS watchPosition error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setGpsError("Location permission denied. Please enable GPS location in your browser.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setGpsError("GPS signal unavailable. Move to an open area with sky visibility.");
          } else {
            setGpsError("GPS lookup timed out. Retrying...");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1500,
        }
      );

      gpsWatchIdRef.current = watchId;
    } else {
      // Demonstration walkthrough mode
      speakInstruction(
        `Starting benchmark route demonstration to ${destination?.name || "destination"}. ${steps[0]?.instruction || ""}`
      );
    }
  };

  const handleStopNavigation = () => {
    if (gpsWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }

    setIsNavigating(false);
    setIsAutoSimulating(false);
    setLiveGpsPosition(null);
    setGpsAccuracy(null);
    setGpsHeading(null);
    setGpsError(null);
    setIsRerouting(false);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      const next = activeStepIndex + 1;
      setActiveStepIndex(next);
      if (steps[next]) speakInstruction(steps[next].instruction);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      const prev = activeStepIndex - 1;
      setActiveStepIndex(prev);
      if (steps[prev]) speakInstruction(steps[prev].instruction);
    }
  };

  // Auto-simulation interval (for benchmark testing and desktop previews)
  useEffect(() => {
    if (!isNavigating || !isAutoSimulating) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          const nextInstruction = steps[next]?.instruction;
          if (nextInstruction) speakInstruction(nextInstruction);
          return next;
        } else {
          setIsAutoSimulating(false);
          speakInstruction("You have arrived at your accessible destination.");
          return prev;
        }
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isNavigating, isAutoSimulating, steps, speakInstruction]);

  // Derive active user coordinate for map display:
  // In live navigation with GPS fix, use liveGpsPosition.
  // In simulation walk mode, project along active step waypoint.
  const activeUserPosition: GeoCoordinates | null = useMemo(() => {
    if (!isNavigating) return null;
    if (liveGpsPosition) return liveGpsPosition;

    if (activeRoute && activeStep) {
      const wayPointIndex = activeStep.wayPoints ? activeStep.wayPoints[0] : 0;
      const coord = activeRoute.coordinates[wayPointIndex] ?? activeRoute.coordinates[0];
      if (coord) {
        return { latitude: coord[0], longitude: coord[1] };
      }
    }
    return null;
  }, [isNavigating, liveGpsPosition, activeRoute, activeStep]);

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
      name: `Pin (${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)})`,
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
      name: `Pin (${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)})`,
      label: `Map Pin: ${clickedMapCoords.latitude.toFixed(4)}, ${clickedMapCoords.longitude.toFixed(4)}`,
      coordinates: clickedMapCoords,
      confidence: 1.0,
    };
    setDestination(loc);
    setClickedMapCoords(null);
  };

  // Get Turn Icon
  const getTurnIcon = (type?: number) => {
    if (type === 1 || type === 7) return <ArrowUpLeft className="h-6 w-6 text-teal-400" />;
    if (type === 2 || type === 8) return <ArrowUpRight className="h-6 w-6 text-teal-400" />;
    return <ArrowUp className="h-6 w-6 text-teal-400" />;
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Apple-style Minimal Header with Start Navigation CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#111110] font-display">
              Route Assessment
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/50">
              MapLibre 3D &bull; OpenFreeMap
            </span>
            {isLiveRoute ? (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Pedestrian Network
              </span>
            ) : (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                Benchmark Network
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pedestrian navigation cross-referenced with your physical tolerances and environmental barriers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {routes.length > 0 && !isNavigating && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartNavigation}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5 text-white animate-spin" style={{ animationDuration: "6s" }} />
              <span>{isLiveRoute ? "Start Live 3D Navigation" : "Start Benchmark Demo"}</span>
            </motion.button>
          )}

          <button
            type="button"
            onClick={handleCalculateRoute}
            disabled={isCalculating || !origin || !destination}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-zinc-800 hover:bg-zinc-50 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={cn("h-3 w-3", isCalculating && "animate-spin")} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Notice & Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {routes.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemoRoute}
                className="px-2.5 py-1 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors cursor-pointer text-[11px]"
              >
                Load Benchmark Demo
              </button>
            )}
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* GPS Error Notification */}
      {gpsError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-rose-600 shrink-0 animate-pulse" />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MapLibre GL JS 3D City Vector Canvas */}
      <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[700px] rounded-3xl overflow-hidden border border-black/[0.08] shadow-sm bg-zinc-100">
        <RouteMapLibre
          routes={routes}
          selectedRouteIndex={selectedRouteIndex}
          onSelectRoute={setSelectedRouteIndex}
          originCoords={origin?.coordinates}
          destinationCoords={destination?.coordinates}
          originLabel={origin?.label}
          destinationLabel={destination?.label}
          onMapClick={handleMapClick}
          className="h-full w-full"
          isNavigating={isNavigating}
          userPosition={activeUserPosition}
          userHeading={gpsHeading}
          is3DMode={is3DMode}
          onToggle3D={() => setIs3DMode(!is3DMode)}
          communityReports={communityReports}
          highlightedReportId={highlightedHazardId}
          onSelectReport={(r) => setHighlightedHazardId(r.id)}
        />

        {/* Proximity Hazard Alert Toast (when passing near community reported obstacles) */}
        <AnimatePresence>
          {activeProximityAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-24 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] z-[1200] p-3.5 rounded-2xl bg-rose-600 text-white shadow-2xl border border-white/20 pointer-events-auto flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0">🚨</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-rose-700">
                      Hazard ~{activeProximityAlert.distanceMeters}m Ahead
                    </span>
                    <span className="text-[10px] font-mono opacity-80 font-semibold">
                      {activeProximityAlert.report.category.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-tight">
                    {activeProximityAlert.report.title}
                  </h4>
                  <p className="text-[11px] text-rose-100">
                    {activeProximityAlert.report.details}
                  </p>
                  <div className="text-[10px] font-semibold text-rose-100 bg-black/20 px-2 py-0.5 rounded-md inline-block">
                    💡 Detour: {activeProximityAlert.report.routeImpact}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveProximityAlert(null)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. LIVE GUIDED NAVIGATION HUD (Heads-Up Display Banner) */}
        <AnimatePresence>
          {isNavigating && activeStep && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-[1100] p-4 rounded-2xl bg-[#111110]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    {getTurnIcon(activeStep.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5 flex-wrap">
                      <span>Step {activeStepIndex + 1} of {steps.length}</span>
                      <span>&bull;</span>
                      <span className="text-zinc-400">{activeStep.distanceMeters}m</span>
                      {gpsAccuracy !== null && (
                        <>
                          <span>&bull;</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1 text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            GPS &plusmn;{gpsAccuracy}m
                          </span>
                        </>
                      )}
                      {isRerouting && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] animate-pulse">
                          Rerouting...
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {activeStep.instruction}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Step-free corridor &bull; Max incline {activeRoute?.characteristics.maxInclinePercent}% &bull; Continuous sidewalk
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => speakInstruction(activeStep.instruction)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Repeat voice announcement"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                    className={cn(
                      "p-2 rounded-xl transition-colors cursor-pointer",
                      isVoiceMuted ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-zinc-300"
                    )}
                    title={isVoiceMuted ? "Unmute voice" : "Mute voice"}
                  >
                    {isVoiceMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopNavigation}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Exit Navigation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar across route */}
              <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${((activeStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Interactive Next/Prev Step Controls & Remaining Stats */}
              <div className="mt-3 flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={activeStepIndex === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <SkipBack className="h-3 w-3" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer",
                      isAutoSimulating
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-teal-500 text-zinc-950 hover:bg-teal-400"
                    )}
                    title="Simulate step movement for testing"
                  >
                    {isAutoSimulating ? (
                      <>
                        <Pause className="h-3 w-3" />
                        <span>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        <span>Simulate Walk</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={activeStepIndex >= steps.length - 1}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <SkipForward className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[11px] text-teal-300 font-bold block">
                    {remainingDistanceMeters !== null
                      ? `${remainingDistanceMeters}m remaining`
                      : `${Math.round(activeRoute?.distanceMeters ?? 0)}m total`}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 block">
                    ~{remainingDurationMinutes ?? activeRoute?.durationMinutes ?? 0} min ETA
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Floating Search Card (Collapsible) */}
        {!isNavigating && (
          <div className="absolute top-4 left-4 z-[1000] w-[340px] sm:w-[380px] max-w-[calc(100%-2rem)] pointer-events-auto">
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-xs font-semibold flex items-center gap-1.5 border border-black/[0.08] hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
              >
                <Navigation className="h-3 w-3 text-teal-600" />
                <span>{showSearchPanel ? "Hide Parameters" : "Search Route"}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", showSearchPanel && "rotate-180")} />
              </button>
            </div>

            <AnimatePresence>
              {showSearchPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="max-h-[calc(100vh-230px)] overflow-y-auto no-scrollbar shadow-2xl rounded-2xl"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 3. Floating Route Selection Segmented Control */}
        {!isNavigating && routes.length > 1 && (
          <div className="absolute bottom-4 left-4 sm:left-1/2 sm:-translate-x-1/2 z-[1000] flex items-center gap-2 p-1.5 rounded-full bg-white/92 backdrop-blur-xl border border-black/[0.08] shadow-xl max-w-[calc(100%-2rem)] overflow-x-auto no-scrollbar pointer-events-auto">
            {routes.map((r, idx) => {
              const isSelected = idx === selectedRouteIndex;
              const mins = Math.round(r.durationMinutes);
              const meters = Math.round(r.distanceMeters);
              const status = r.assessment?.overallOutcome ?? "suitable";

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                    isSelected
                      ? "text-white font-semibold"
                      : "text-zinc-700 hover:text-black hover:bg-black/[0.04]"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="route-pill-active"
                      className="absolute inset-0 rounded-full bg-[#111110] shadow-sm"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{r.name}</span>
                  <span
                    className={cn(
                      "relative z-10 font-mono text-[11px] tabular-nums",
                      isSelected ? "text-zinc-300" : "text-zinc-500"
                    )}
                  >
                    {mins}m &bull; {meters}m
                  </span>
                  <span
                    className={cn(
                      "relative z-10 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold",
                      status === "suitable"
                        ? isSelected
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-emerald-100 text-emerald-800"
                        : isSelected
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {status === "suitable" ? "Clear" : "Barriers"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 4. Map Click Pin Banner (iOS Floating Notification) */}
        <AnimatePresence>
          {clickedMapCoords && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-4 right-4 z-[1050] p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] text-zinc-900 shadow-xl flex items-center gap-3 pointer-events-auto"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="h-3.5 w-3.5 text-teal-600" />
                <span className="font-mono text-[11px]">
                  ({clickedMapCoords.latitude.toFixed(4)}, {clickedMapCoords.longitude.toFixed(4)})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetClickedAsOrigin}
                  className="text-xs px-2.5 py-1 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors cursor-pointer"
                >
                  Set Origin
                </button>
                <button
                  type="button"
                  onClick={handleSetClickedAsDestination}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#111110] hover:bg-zinc-800 text-white font-medium transition-colors cursor-pointer"
                >
                  Set Destination
                </button>
                <button
                  type="button"
                  onClick={() => setClickedMapCoords(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comprehensive Route Details Panel */}
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
