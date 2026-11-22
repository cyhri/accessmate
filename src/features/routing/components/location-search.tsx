"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Search,
  Crosshair,
  UserCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const originWrapperRef = useRef<HTMLDivElement>(null);
  const destWrapperRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originWrapperRef.current && !originWrapperRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destWrapperRef.current && !destWrapperRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch geocoding suggestions
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
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">
            Route Search &amp; Spatial Parameters
          </h2>
        </div>
        <Badge variant="teal" size="sm">
          Wheelchair Profile Active
        </Badge>
      </div>

      {/* Profile Persona Selection */}
      <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-teal-600" />
            Evaluation Profile Criteria
          </label>
          <span className="text-xs text-teal-700 font-semibold">
            {selectedProfile.name}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PROFILE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPersonaPreset(preset)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                selectedProfile.id === preset.id
                  ? "bg-teal-600 text-white border-teal-600 font-semibold shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="space-y-3 relative">
        {/* Origin Search */}
        <div ref={originWrapperRef} className="relative">
          <label htmlFor="origin-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
              Origin / Starting Point
            </span>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Crosshair className="h-3 w-3" />
              Use Current Location
            </button>
          </label>

          <div className="relative">
            <input
              id="origin-input"
              type="text"
              value={originQuery}
              onChange={(e) => handleOriginChange(e.target.value)}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Search origin location or click map..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-teal-600" />
            {isSearchingOrigin && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Origin Autocomplete Dropdown */}
          {showOriginDropdown && originSuggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-56 overflow-y-auto">
              {originSuggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => {
                    onSelectOrigin(sug);
                    setOriginQuery(sug.label);
                    setShowOriginDropdown(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-teal-50/70 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-slate-900">{sug.name}</div>
                  <div className="text-slate-500 text-[11px] truncate">{sug.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={onSwapLocations}
            aria-label="Swap origin and destination"
            className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition-colors shadow-2xs cursor-pointer z-10"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Destination Search */}
        <div ref={destWrapperRef} className="relative">
          <label htmlFor="destination-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            Destination / Arrival Point
          </label>

          <div className="relative">
            <input
              id="destination-input"
              type="text"
              value={destQuery}
              onChange={(e) => handleDestChange(e.target.value)}
              onFocus={() => setShowDestDropdown(true)}
              placeholder="Search destination location or click map..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-rose-600" />
            {isSearchingDest && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestDropdown && destSuggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-56 overflow-y-auto">
              {destSuggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => {
                    onSelectDestination(sug);
                    setDestQuery(sug.label);
                    setShowDestDropdown(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-teal-50/70 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-slate-900">{sug.name}</div>
                  <div className="text-slate-500 text-[11px] truncate">{sug.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {geoError && (
        <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          {geoError}
        </div>
      )}

      {/* Preset Route Pairs for 1-Click Testing */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-teal-600" />
          Quick Test Route Pairs:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyPresetPair(0, 1)}
            className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 transition-colors border border-slate-200 cursor-pointer"
          >
            Station &rarr; Library
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetPair(0, 2)}
            className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 transition-colors border border-slate-200 cursor-pointer"
          >
            Station &rarr; Hospital
          </button>
          <button
            type="button"
            onClick={() => handleApplyPresetPair(3, 4)}
            className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 transition-colors border border-slate-200 cursor-pointer"
          >
            Civic Plaza &rarr; Gardens
          </button>
        </div>
      </div>

      {/* Calculate Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onCalculateRoute}
        disabled={isCalculating || !origin || !destination}
        className="w-full justify-center"
        leftIcon={
          isCalculating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )
        }
      >
        {isCalculating ? "Evaluating Route Compatibility..." : "Calculate Accessible Route"}
      </Button>
    </div>
  );
}
