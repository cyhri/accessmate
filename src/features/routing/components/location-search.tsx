"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  Search,
  Crosshair,
  UserCheck,
  Sparkles,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeocodingResult, GeoCoordinates } from "../types";
import { DEMO_LOCATIONS } from "../demo-routes";
import { PROFILE_PRESETS, type ProfilePreset } from "@/features/profiles";
import type { UserAccessibilityProfile } from "@/types/profile";

export interface LocationSearchProps {
  readonly origin: GeocodingResult | null;
  readonly destination: GeocodingResult | null;
  readonly onSelectOrigin: (loc: GeocodingResult) => void;
  readonly onSelectDestination: (loc: GeocodingResult) => void;
  readonly onSwapLocations: () => void;
  readonly onCalculateRoute: () => void;
  readonly isCalculating: boolean;
  readonly selectedProfile: UserAccessibilityProfile;
  readonly onSelectProfile: (profile: UserAccessibilityProfile) => void;
  readonly className?: string;
}

export function LocationSearch({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onSwapLocations,
  onCalculateRoute,
  isCalculating,
  selectedProfile,
  onSelectProfile,
  className,
}: LocationSearchProps) {
  const [prevOrigin, setPrevOrigin] = useState(origin);
  const [originQuery, setOriginQuery] = useState(origin?.label ?? "");
  if (origin !== prevOrigin) {
    setPrevOrigin(origin);
    setOriginQuery(origin?.label ?? "");
  }

  const [prevDest, setPrevDest] = useState(destination);
  const [destQuery, setDestQuery] = useState(destination?.label ?? "");
  if (destination !== prevDest) {
    setPrevDest(destination);
    setDestQuery(destination?.label ?? "");
  }

  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const originWrapperRef = useRef<HTMLDivElement>(null);
  const destWrapperRef = useRef<HTMLDivElement>(null);
  const profileWrapperRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originWrapperRef.current && !originWrapperRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destWrapperRef.current && !destWrapperRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
      if (profileWrapperRef.current && !profileWrapperRef.current.contains(e.target as Node)) {
        setShowProfileSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (
    query: string,
    setResults: (res: GeocodingResult[]) => void,
    setLoading: (l: boolean) => void
  ) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/routes/geocode?text=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOriginChange = (val: string) => {
    setOriginQuery(val);
    setShowOriginDropdown(true);
    fetchSuggestions(val, setOriginSuggestions, setIsSearchingOrigin);
  };

  const handleDestChange = (val: string) => {
    setDestQuery(val);
    setShowDestDropdown(true);
    fetchSuggestions(val, setDestSuggestions, setIsSearchingDest);
  };

  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: GeoCoordinates = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        const currentLoc: GeocodingResult = {
          id: `current-loc-${Date.now()}`,
          name: "My Current Location",
          label: `Current Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
          coordinates: coords,
          confidence: 1.0,
        };
        onSelectOrigin(currentLoc);
        setOriginQuery(currentLoc.label);
      },
      (err) => {
        setGeoError(`Location permission denied or unavailable (${err.message}).`);
      },
      { timeout: 8000 }
    );
  };

  const handleApplyPresetPair = (origIdx: number, destIdx: number) => {
    const o = DEMO_LOCATIONS[origIdx];
    const d = DEMO_LOCATIONS[destIdx];
    if (o && d) {
      onSelectOrigin(o);
      onSelectDestination(d);
    }
  };

  const handleSelectPersonaPreset = (preset: ProfilePreset) => {
    onSelectProfile({
      id: preset.id,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...preset.data,
    });
    setShowProfileSelector(false);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-black/[0.08] bg-white/92 backdrop-blur-xl p-4 sm:p-5 shadow-lg shadow-black/[0.04] space-y-4 text-zinc-900 transition-all",
        className
      )}
    >
      {/* Profile Bar - Apple Settings Segmented Style */}
      <div ref={profileWrapperRef} className="relative">
        <div className="flex items-center justify-between gap-2 pb-1">
          <button
            type="button"
            onClick={() => setShowProfileSelector(!showProfileSelector)}
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5 text-teal-600" />
            <span className="font-semibold truncate max-w-[170px]">
              {selectedProfile.name}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-zinc-400 group-hover:text-zinc-700 transition-transform",
                showProfileSelector && "rotate-180"
              )}
            />
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-[11px] font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Crosshair className="h-3 w-3" />
            <span>Current GPS</span>
          </button>
        </div>

        {/* Profile Preset Dropdown */}
        <AnimatePresence>
          {showProfileSelector && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1.5 z-50 w-full rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-xl space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Select Mobility Persona
              </div>
              {PROFILE_PRESETS.map((preset) => {
                const isSelected = selectedProfile.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPersonaPreset(preset)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer",
                      isSelected
                        ? "bg-teal-50 text-teal-900 font-semibold"
                        : "text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span>{preset.name}</span>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Origin & Destination Journey Card */}
      <div className="relative rounded-xl border border-black/[0.06] bg-zinc-50/70 p-2.5 space-y-2">
        {/* Visual Connecting Track Indicator */}
        <div className="absolute left-[21px] top-[26px] bottom-[26px] w-[2px] bg-zinc-200 pointer-events-none flex flex-col justify-between items-center">
          <div className="w-[1px] h-full bg-gradient-to-b from-teal-500 via-zinc-300 to-rose-500" />
        </div>

        {/* Origin Field */}
        <div ref={originWrapperRef} className="relative pl-7">
          <div className="absolute left-1 top-2.5 h-3.5 w-3.5 rounded-full border-2 border-teal-600 bg-white flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />
          </div>

          <div className="relative flex items-center">
            <input
              id="origin-input"
              type="text"
              value={originQuery}
              onChange={(e) => handleOriginChange(e.target.value)}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Starting point..."
              className="w-full rounded-lg bg-white border border-black/[0.06] px-3 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
            />
            {originQuery && (
              <button
                type="button"
                onClick={() => {
                  setOriginQuery("");
                  setShowOriginDropdown(false);
                }}
                className="absolute right-2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {isSearchingOrigin && (
              <Loader2 className="absolute right-2 h-3.5 w-3.5 text-zinc-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showOriginDropdown && originSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="absolute left-7 right-0 z-50 mt-1 rounded-xl border border-black/[0.08] bg-white shadow-xl overflow-hidden max-h-52 overflow-y-auto"
              >
                {originSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => {
                      onSelectOrigin(sug);
                      setOriginQuery(sug.label);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 border-b border-black/[0.03] last:border-0 transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-zinc-900">{sug.name}</div>
                    <div className="text-zinc-500 text-[11px] truncate">{sug.label}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swap Button In-Between */}
        <div className="relative flex justify-end pr-2 -my-1 z-10">
          <button
            type="button"
            onClick={onSwapLocations}
            aria-label="Swap origin and destination"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-black/[0.08] bg-white text-zinc-500 hover:text-teal-700 hover:bg-zinc-50 shadow-2xs transition-transform active:rotate-180 cursor-pointer"
          >
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        {/* Destination Field */}
        <div ref={destWrapperRef} className="relative pl-7">
          <div className="absolute left-1 top-2.5 h-3.5 w-3.5 rounded-full border-2 border-rose-600 bg-white flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-600" />
          </div>

          <div className="relative flex items-center">
            <input
              id="destination-input"
              type="text"
              value={destQuery}
              onChange={(e) => handleDestChange(e.target.value)}
              onFocus={() => setShowDestDropdown(true)}
              placeholder="Destination..."
              className="w-full rounded-lg bg-white border border-black/[0.06] px-3 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 shadow-2xs focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
            />
            {destQuery && (
              <button
                type="button"
                onClick={() => {
                  setDestQuery("");
                  setShowDestDropdown(false);
                }}
                className="absolute right-2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {isSearchingDest && (
              <Loader2 className="absolute right-2 h-3.5 w-3.5 text-zinc-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDestDropdown && destSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="absolute left-7 right-0 z-50 mt-1 rounded-xl border border-black/[0.08] bg-white shadow-xl overflow-hidden max-h-52 overflow-y-auto"
              >
                {destSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => {
                      onSelectDestination(sug);
                      setDestQuery(sug.label);
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 border-b border-black/[0.03] last:border-0 transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-zinc-900">{sug.name}</div>
                    <div className="text-zinc-500 text-[11px] truncate">{sug.label}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {geoError && (
        <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          {geoError}
        </div>
      )}

      {/* Preset Pairs (Apple Quick Suggestions) */}
      <div className="space-y-1.5 pt-0.5">
        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-teal-600" />
          Suggested routes
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyPresetPair(0, 1)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors cursor-pointer"
          >
            Station &rarr; Library
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetPair(0, 2)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors cursor-pointer"
          >
            Station &rarr; Hospital
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetPair(3, 4)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors cursor-pointer"
          >
            Plaza &rarr; Gardens
          </button>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onCalculateRoute}
        disabled={isCalculating || !origin || !destination}
        className={cn(
          "w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]",
          isCalculating || !origin || !destination
            ? "bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none"
            : "bg-[#111110] hover:bg-zinc-800"
        )}
      >
        {isCalculating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Evaluating Accessibility...</span>
          </>
        ) : (
          <>
            <Search className="h-3.5 w-3.5" />
            <span>Find Accessible Route</span>
          </>
        )}
      </button>
    </div>
  );
}
