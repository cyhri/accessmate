"use client";

import React from "react";
import {
  UserCheck,
  Edit3,
  Sliders,
  Eye,
  Volume2,
  Activity,
} from "lucide-react";
import type { UserAccessibilityProfile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export interface ProfileSummaryProps {
  readonly profile: UserAccessibilityProfile;
  readonly onEdit: () => void;
}

export function ProfileSummary({ profile, onEdit }: ProfileSummaryProps) {
  // Count essential and preferred constraints across all domains
  const countRequirements = (p: UserAccessibilityProfile) => {
    let essential = 0;
    let preferred = 0;

    const checkLevel = (level?: string) => {
      if (level === "essential") essential++;
      if (level === "preferred") preferred++;
    };

    // Mobility
    checkLevel(p.mobility.requiresStepFreeAccess);
    checkLevel(p.mobility.requiresHandrails);
    checkLevel(p.mobility.requiresAccessibleRestroom);
    checkLevel(p.mobility.requiresElevatorForLevels);
    checkLevel(p.mobility.requiresFrequentRestStops);

    // Vision
    checkLevel(p.vision.requiresTactileGroundPaving);
    checkLevel(p.vision.requiresAudioGuidance);
    checkLevel(p.vision.requiresHighContrastSignage);
    checkLevel(p.vision.requiresIdentifiableEntrances);
    checkLevel(p.vision.requiresObstacleFreePaths);
    checkLevel(p.vision.requiresBrailleSignage);

    // Hearing
    checkLevel(p.hearing.requiresVisualAnnouncements);
    checkLevel(p.hearing.requiresWrittenInstructions);
    checkLevel(p.hearing.requiresVisualEmergencyAlerts);
    checkLevel(p.hearing.requiresClearVisualSignage);
    checkLevel(p.hearing.requiresHearingLoop);

    // Sensory
    checkLevel(p.sensory.prefersQuieterEnvironments);
    checkLevel(p.sensory.requiresPredictableWayfinding);
    checkLevel(p.sensory.prefersSimpleSignage);
    checkLevel(p.sensory.requiresReducedSensoryStimulation);
    checkLevel(p.sensory.prefersClearlyMarkedRoutes);

    return { essential, preferred };
  };

  const { essential, preferred } = countRequirements(profile);

  const formatAidLabel = (aid: string) => {
    return aid
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const renderBadge = (level: string) => {
    if (level === "essential") {
      return (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
          Essential
        </span>
      );
    }
    if (level === "preferred") {
      return (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
          Preferred
        </span>
      );
    }
    return (
      <span className="text-[11px] text-zinc-400">Not needed</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Apple Settings / Health Profile Header */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-800 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-[#111110] font-display">
                  {profile.name}
                </h2>
                <Badge variant="teal" size="sm">
                  {profile.preferredCategory.replace(/_/g, " ")}
                </Badge>
                {profile.isDefault && (
                  <Badge variant="navy" size="sm">
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Updated {formatDate(profile.updatedAt)} &bull; Criteria identifier: <span className="font-mono">{profile.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111110] text-white text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {profile.notes && (
          <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-black/[0.04]">
            &ldquo;{profile.notes}&rdquo;
          </p>
        )}

        {/* Quick Summary Insets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] text-center">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
              Primary Aid
            </span>
            <span className="text-sm font-bold text-[#111110] mt-0.5 block truncate">
              {formatAidLabel(profile.mobility.primaryAid)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/50 text-center">
            <span className="text-[10px] uppercase font-semibold text-teal-800 tracking-wider block">
              Essential
            </span>
            <span className="text-base font-bold text-teal-900 font-mono tabular-nums mt-0.5 block">
              {essential}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/50 text-center">
            <span className="text-[10px] uppercase font-semibold text-amber-800 tracking-wider block">
              Preferred
            </span>
            <span className="text-base font-bold text-amber-900 font-mono tabular-nums mt-0.5 block">
              {preferred}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] text-center">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
              Temporary
            </span>
            <span className="text-sm font-bold text-[#111110] mt-0.5 block">
              {profile.temporary.hasTemporaryLimitation ? "Active" : "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Domain Breakdown in Apple Settings Grouped Insets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Mobility Constraints */}
        <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-black/[0.04] bg-zinc-50/60 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Mobility &amp; Access Ingress
            </h3>
          </div>

          <div className="divide-y divide-black/[0.04] text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Step-free entrance</span>
              {renderBadge(profile.mobility.requiresStepFreeAccess)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Elevator for upper floors</span>
              {renderBadge(profile.mobility.requiresElevatorForLevels)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Continuous handrails</span>
              {renderBadge(profile.mobility.requiresHandrails)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Accessible restroom</span>
              {renderBadge(profile.mobility.requiresAccessibleRestroom)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Max step tolerance</span>
              <span className="font-mono font-semibold text-[#111110] tabular-nums">
                {profile.mobility.maxStepHeightCm !== null ? `${profile.mobility.maxStepHeightCm} cm` : "0 cm"}
              </span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Min door width</span>
              <span className="font-mono font-semibold text-[#111110] tabular-nums">
                {profile.mobility.minDoorwayWidthCm !== null ? `${profile.mobility.minDoorwayWidthCm} cm` : "80 cm"}
              </span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Max ramp slope</span>
              <span className="font-mono font-semibold text-[#111110] tabular-nums">
                {profile.mobility.maxRampSlopePercent !== null ? `${profile.mobility.maxRampSlopePercent}%` : "6%"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Vision & Sensory Wayfinding */}
        <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-black/[0.04] bg-zinc-50/60 flex items-center gap-2">
            <Eye className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Vision &amp; Sensory Guidance
            </h3>
          </div>

          <div className="divide-y divide-black/[0.04] text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Tactile paving</span>
              {renderBadge(profile.vision.requiresTactileGroundPaving)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Audio wayfinding</span>
              {renderBadge(profile.vision.requiresAudioGuidance)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">High-contrast signs</span>
              {renderBadge(profile.vision.requiresHighContrastSignage)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Braille signage</span>
              {renderBadge(profile.vision.requiresBrailleSignage)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Low-sensory quiet areas</span>
              {renderBadge(profile.sensory.prefersQuieterEnvironments)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Predictable paths</span>
              {renderBadge(profile.sensory.requiresPredictableWayfinding)}
            </div>
          </div>
        </div>

        {/* 3. Hearing & Communication */}
        <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-black/[0.04] bg-zinc-50/60 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Hearing &amp; Visual Alerts
            </h3>
          </div>

          <div className="divide-y divide-black/[0.04] text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Visual displays</span>
              {renderBadge(profile.hearing.requiresVisualAnnouncements)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Emergency strobe alerts</span>
              {renderBadge(profile.hearing.requiresVisualEmergencyAlerts)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Written instructions</span>
              {renderBadge(profile.hearing.requiresWrittenInstructions)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Induction loop (T-coil)</span>
              {renderBadge(profile.hearing.requiresHearingLoop)}
            </div>
          </div>
        </div>

        {/* 4. Stamina & Temporary Restrictions */}
        <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-black/[0.04] bg-zinc-50/60 flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Stamina &amp; Temporary Limits
            </h3>
          </div>

          <div className="divide-y divide-black/[0.04] text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Frequent rest benches</span>
              {renderBadge(profile.mobility.requiresFrequentRestStops)}
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Max walking endurance</span>
              <span className="font-mono font-semibold text-[#111110] tabular-nums">
                {profile.mobility.maxWalkingDistanceMeters !== null
                  ? `${profile.mobility.maxWalkingDistanceMeters} m`
                  : "Unlimited"}
              </span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-zinc-600">Temporary condition</span>
              <span className="font-semibold text-zinc-800">
                {profile.temporary.hasTemporaryLimitation ? "Active" : "None"}
              </span>
            </div>
            {profile.temporary.hasTemporaryLimitation && (
              <div className="p-3.5 bg-amber-50/60 text-amber-900 space-y-1">
                <div className="font-semibold">{profile.temporary.description}</div>
                {profile.temporary.expectedDurationDays && (
                  <div className="text-[11px] text-amber-800">
                    Expected recovery in ~{profile.temporary.expectedDurationDays} days
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
