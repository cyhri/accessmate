"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Clock,
  Plus,
  MapPin,
  Users,
  Check,
  Radio,
  Crosshair,
  Volume2,
  VolumeX,
  X,
  Layers,
  ChevronDown,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GeoCoordinates } from "@/types/common";
import {
  type CommunityReport,
  type ReportCategory,
  type ReportSeverity,
  type HazardProximityAlert,
  INITIAL_COMMUNITY_REPORTS,
  reportsRepository,
  checkHazardProximity,
} from "@/features/reports";

// Dynamically import MapLibre 3D Vector Map with SSR disabled
const RouteMapLibre = dynamic(
  () => import("@/features/routing/components/route-maplibre"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] sm:h-[440px] w-full rounded-3xl border border-black/[0.08] bg-zinc-100 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2 animate-pulse">
        <Navigation className="h-5 w-5 text-teal-700 animate-spin" />
        <span className="text-xs font-semibold text-zinc-700">Loading 3D Community Hazard Map...</span>
      </div>
    ),
  }
);

const CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: "construction", label: "Construction Detour", icon: "🚧" },
  { value: "surface", label: "Broken Road / Surface", icon: "🛣️" },
  { value: "elevator", label: "Elevator Outage", icon: "🛗" },
  { value: "curb_ramp", label: "Missing Curb Ramp / Steps", icon: "♿" },
  { value: "restroom", label: "Accessible Restroom", icon: "🚻" },
  { value: "other", label: "Other Physical Barrier", icon: "⚠️" },
];

const SEVERITIES: { value: ReportSeverity; label: string; color: string }[] = [
  { value: "critical", label: "Critical (Wheelchair Blocked)", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { value: "warning", label: "Warning (Difficult / Narrow)", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "info", label: "Informational", color: "text-zinc-700 bg-zinc-50 border-zinc-200" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>(() => [...INITIAL_COMMUNITY_REPORTS]);

  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCoords, setNewCoords] = useState<GeoCoordinates | null>(null);
  const [newCategory, setNewCategory] = useState<ReportCategory>("construction");
  const [newSeverity, setNewSeverity] = useState<ReportSeverity>("warning");
  const [newDetails, setNewDetails] = useState("");
  const [newRouteImpact, setNewRouteImpact] = useState("");
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);

  // Live GPS Hazard Proximity Radar
  const [isRadarActive, setIsRadarActive] = useState(false);
  const [userGpsPosition, setUserGpsPosition] = useState<GeoCoordinates | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [activeProximityAlert, setActiveProximityAlert] = useState<HazardProximityAlert | null>(null);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  const radarWatchIdRef = useRef<number | null>(null);
  const recentAlertsRef = useRef<Record<string, number>>({});

  // Sync reports across storage events and on client mount
  useEffect(() => {
    const handleUpdate = () => {
      setReports(reportsRepository.getReports());
    };
    handleUpdate();
    window.addEventListener("accessmate:reports-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:reports-updated", handleUpdate);
  }, []);

  // Web Speech Announcement
  const speakAlert = useCallback(
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
        // Ignore speech synthesis failures gracefully
      }
    },
    [isVoiceMuted]
  );

  // Toggle Live GPS Radar for Proximity Alerting
  const toggleRadar = () => {
    if (isRadarActive) {
      if (radarWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(radarWatchIdRef.current);
        radarWatchIdRef.current = null;
      }
      setIsRadarActive(false);
      setUserGpsPosition(null);
      setActiveProximityAlert(null);
    } else {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      setIsRadarActive(true);
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: GeoCoordinates = {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          };
          setUserGpsPosition(coords);
          setGpsAccuracy(Math.round(pos.coords.accuracy));

          // Check proximity against active community reports
          const alertResult = checkHazardProximity(coords, reports, 50, recentAlertsRef.current);
          if (alertResult) {
            recentAlertsRef.current[alertResult.report.id] = Date.now();
            setActiveProximityAlert(alertResult);
            setHighlightedReportId(alertResult.report.id);
            speakAlert(`Caution: ${alertResult.report.title} ahead. ${alertResult.report.routeImpact}`);
          }
        },
        (err) => {
          console.warn("Radar GPS error:", err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
      );

      radarWatchIdRef.current = watchId;
    }
  };

  useEffect(() => {
    return () => {
      if (radarWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(radarWatchIdRef.current);
        radarWatchIdRef.current = null;
      }
    };
  }, []);

  const handleConfirm = (id: string) => {
    if (confirmedIds.has(id)) return;
    setConfirmedIds((prev) => new Set([...prev, id]));
    reportsRepository.confirmReport(id);
    setReports(reportsRepository.getReports());
  };

  // Map click or picker update
  const handlePickerCoordsChange = async (coords: GeoCoordinates) => {
    setNewCoords(coords);
    try {
      const res = await fetch(`/api/routes/geocode?lat=${coords.latitude}&lon=${coords.longitude}`);
      if (res.ok) {
        const data = await res.json();
        if (data.result?.label) {
          setNewLocation(data.result.label);
          return;
        }
      }
    } catch {
      // Fallback to formatted coordinates
    }
    setNewLocation(`Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
  };

  // Use current GPS to drop pin
  const handleUseCurrentGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: GeoCoordinates = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        handlePickerCoordsChange(coords);
        if (!showSubmitModal) setShowSubmitModal(true);
      },
      (err) => {
        alert("Could not acquire GPS position: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Use selected pin coords, or fallback near central station if none picked
    const coords: GeoCoordinates = newCoords ?? {
      latitude: 52.5235,
      longitude: 13.3702,
    };

    const newRep: CommunityReport = {
      id: `rep-${Date.now()}`,
      title: newTitle.trim(),
      location: newLocation.trim() || `Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
      coordinates: coords,
      category: newCategory,
      severity: newSeverity,
      createdAt: new Date().toISOString(),
      timeAgo: "Just now",
      confirmationCount: 1,
      details: newDetails.trim() || "Community verified physical barrier.",
      routeImpact: newRouteImpact.trim() || "Exercise caution or use alternative routing corridor.",
      status: "active",
      reportedBy: "Community Reporter",
    };

    reportsRepository.saveReport(newRep);
    setReports(reportsRepository.getReports());

    // Reset Form
    setNewTitle("");
    setNewLocation("");
    setNewCoords(null);
    setNewDetails("");
    setNewRouteImpact("");
    setIsPickingOnMap(false);
    setShowSubmitModal(false);
    setHighlightedReportId(newRep.id);
  };

  const filtered = reports.filter((r) => {
    if (filter === "active") return r.status === "active";
    if (filter === "resolved") return r.status === "resolved";
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#111110] font-display">
              Community Reports &amp; Live Alerts
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/50">
              Peer Network
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time peer reports for broken roads, elevator outages, curb obstacles, and construction detours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live GPS Proximity Radar Toggle */}
          <button
            type="button"
            onClick={toggleRadar}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer",
              isRadarActive
                ? "bg-emerald-600 text-white shadow-emerald-600/20 animate-pulse"
                : "bg-white border border-black/[0.08] text-zinc-700 hover:bg-zinc-50"
            )}
            title="Enable live GPS radar to alert you when walking near obstacles"
          >
            <Radio className={cn("h-3.5 w-3.5", isRadarActive && "animate-spin")} />
            <span>{isRadarActive ? `GPS Radar Active (±${gpsAccuracy ?? 5}m)` : "Enable GPS Radar"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSubmitModal(!showSubmitModal);
              setIsPickingOnMap(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111110] text-white text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Report Obstacle</span>
          </button>
        </div>
      </div>

      {/* Proximity Hazard Alert Toast Banner (Triggered when passing near an obstacle) */}
      <AnimatePresence>
        {activeProximityAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="p-4 rounded-2xl bg-rose-600 text-white shadow-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                🚨
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-rose-700">
                    Proximity Alert &bull; ~{activeProximityAlert.distanceMeters}m Ahead
                  </span>
                  <span className="text-[11px] font-mono opacity-80 font-semibold">
                    {activeProximityAlert.report.category.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-bold leading-tight">
                  {activeProximityAlert.report.title}
                </h3>
                <p className="text-xs opacity-90">
                  {activeProximityAlert.report.details}
                </p>
                <div className="text-[11px] font-semibold text-rose-100 bg-black/20 px-2 py-0.5 rounded-md inline-block mt-1">
                  💡 Detour: {activeProximityAlert.report.routeImpact}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => speakAlert(activeProximityAlert.message)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                title="Repeat voice alert"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                title={isVoiceMuted ? "Unmute" : "Mute voice"}
              >
                {isVoiceMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveProximityAlert(null)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Obstacle Form Panel */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.form
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            onSubmit={handleAddReport}
            className="p-5 rounded-3xl border border-black/[0.08] bg-white shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#111110]">
                  Submit Temporary Obstacle Report
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Saves to live map &amp; alerts nearby pedestrians
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs cursor-pointer p-1"
              >
                &times; Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Obstacle Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Broken road, loose bricks &amp; scaffolding"
                  className="w-full rounded-xl border border-black/[0.08] px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Location Picker with Interactive Map Pin & GPS */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-700 block">
                    Location / Address *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPickingOnMap(!isPickingOnMap)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer",
                        isPickingOnMap
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-teal-50 text-teal-800 hover:bg-teal-100"
                      )}
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{isPickingOnMap ? "Picking on Map..." : "Choose on Map"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseCurrentGps}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 flex items-center gap-1 transition-all cursor-pointer"
                      title="Use my current GPS position"
                    >
                      <Crosshair className="h-3 w-3" />
                      <span>Use GPS</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Moltkebrücke, North Entry"
                    className="w-full rounded-xl border border-black/[0.08] px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black pr-24"
                  />
                  {newCoords && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 font-semibold">
                      {newCoords.latitude.toFixed(4)}, {newCoords.longitude.toFixed(4)}
                    </span>
                  )}
                </div>

                {isPickingOnMap && (
                  <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1 animate-pulse pt-0.5">
                    <span>📍 Click anywhere on the 3D map below to drop or drag the obstacle pin.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Category & Severity Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Barrier Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewCategory(c.value)}
                      className={cn(
                        "px-2 py-1.5 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer text-left",
                        newCategory === c.value
                          ? "bg-[#111110] text-white border-black font-semibold shadow-2xs"
                          : "bg-zinc-50 border-black/[0.06] text-zinc-700 hover:bg-zinc-100"
                      )}
                    >
                      <span>{c.icon}</span>
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Severity Level
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setNewSeverity(s.value)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl border text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer text-left",
                        newSeverity === s.value
                          ? cn("border-2 font-bold shadow-2xs", s.color)
                          : "bg-zinc-50 border-black/[0.06] text-zinc-700 hover:bg-zinc-100"
                      )}
                    >
                      <span>{s.label}</span>
                      {newSeverity === s.value && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Details & Detour Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Details &amp; Clearance Restrictions
                </label>
                <textarea
                  rows={2}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Describe width restrictions, broken surface, or steps..."
                  className="w-full rounded-xl border border-black/[0.08] px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Recommended Detour / Transit Impact
                </label>
                <textarea
                  rows={2}
                  value={newRouteImpact}
                  onChange={(e) => setNewRouteImpact(e.target.value)}
                  placeholder="e.g. Cross to east sidewalk, or use south elevator detour."
                  className="w-full rounded-xl border border-black/[0.08] px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-black/[0.04]">
              <span className="text-[11px] text-zinc-400">
                {newCoords ? `Pinned at: (${newCoords.latitude.toFixed(4)}, ${newCoords.longitude.toFixed(4)})` : "Click 'Choose on Map' to pin coordinates"}
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
              >
                Publish Community Alert
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Interactive 3D Community Hazard Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-teal-600" />
              <span>Interactive City Hazard Map</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({reports.filter((r) => r.status === "active").length} active barriers marked)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-xs text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>{showMap ? "Hide Map" : "Show Map"}</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", showMap && "rotate-180")} />
          </button>
        </div>

        {showMap && (
          <div className="relative w-full h-[380px] sm:h-[450px] rounded-3xl overflow-hidden border border-black/[0.08] shadow-sm bg-zinc-100">
            <RouteMapLibre
              communityReports={reports}
              highlightedReportId={highlightedReportId}
              onSelectReport={(r) => setHighlightedReportId(r.id)}
              pickerCoords={newCoords}
              onPickerCoordsChange={handlePickerCoordsChange}
              userPosition={userGpsPosition}
              className="h-full w-full"
            />

            {/* In-Map Helper Pill */}
            <div className="absolute top-4 left-4 z-[20] pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/[0.08] shadow-md text-zinc-800 text-xs font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span>Active Hazards Marked</span>
                {isPickingOnMap && (
                  <span className="text-teal-700 font-bold ml-1 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Click to Drop Pin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs (Apple Segmented Style) */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="inline-flex rounded-full bg-zinc-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full transition-all cursor-pointer",
              filter === "all"
                ? "bg-white text-[#111110] font-semibold shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            All Alerts ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={cn(
              "px-3 py-1 rounded-full transition-all cursor-pointer",
              filter === "active"
                ? "bg-white text-[#111110] font-semibold shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            Active Hazards ({reports.filter((r) => r.status === "active").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("resolved")}
            className={cn(
              "px-3 py-1 rounded-full transition-all cursor-pointer",
              filter === "resolved"
                ? "bg-white text-[#111110] font-semibold shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            Resolved ({reports.filter((r) => r.status === "resolved").length})
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
          Live Peer Verification Network
        </span>
      </div>

      {/* Incident Cards Stream */}
      <div className="space-y-3">
        {filtered.map((report) => {
          const isCritical = report.severity === "critical";
          const isResolved = report.status === "resolved";
          const hasConfirmed = confirmedIds.has(report.id);
          const isSelected = highlightedReportId === report.id;

          return (
            <div
              key={report.id}
              className={cn(
                "rounded-2xl border p-4 sm:p-5 bg-white transition-all shadow-xs space-y-3",
                isSelected && "ring-2 ring-teal-500 border-teal-500",
                isCritical
                  ? "border-rose-200/80"
                  : isResolved
                  ? "border-emerald-200/80"
                  : "border-amber-200/80"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isCritical ? "error" : isResolved ? "success" : "warning"}
                    size="sm"
                    dot
                  >
                    {isResolved ? "Resolved" : isCritical ? "Critical Barrier" : "Temporary Obstacle"}
                  </Badge>
                  <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {report.timeAgo}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono">
                    {report.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                    <Users className="h-3 w-3 text-zinc-400" />
                    <span className="tabular-nums font-mono">{report.confirmationCount}</span> confirmations
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setHighlightedReportId(report.id);
                      setShowMap(true);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                    title="Center on map"
                  >
                    <MapPin className="h-3 w-3 text-teal-600" />
                    <span>View on Map</span>
                  </button>

                  {!isResolved && (
                    <button
                      type="button"
                      onClick={() => handleConfirm(report.id)}
                      disabled={hasConfirmed}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-1",
                        hasConfirmed
                          ? "bg-emerald-50 text-emerald-800 cursor-default"
                          : "bg-teal-600 hover:bg-teal-700 text-white"
                      )}
                    >
                      {hasConfirmed ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Confirmed</span>
                        </>
                      ) : (
                        <span>Verify Barrier</span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#111110] font-display">
                  {report.title}
                </h3>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>{report.location}</span>
                  <span className="font-mono text-[10px] text-zinc-400 ml-1">
                    ({report.coordinates.latitude.toFixed(4)}, {report.coordinates.longitude.toFixed(4)})
                  </span>
                </p>
                <p className="text-xs text-zinc-700 leading-relaxed pt-1">
                  {report.details}
                </p>
              </div>

              {/* Transit Detour Guidance */}
              <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] text-xs space-y-0.5">
                <span className="font-semibold text-zinc-900 block text-[10px] uppercase tracking-wider text-zinc-400">
                  Recommended Transit Adjustment
                </span>
                <p className="text-zinc-700 leading-relaxed">{report.routeImpact}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
