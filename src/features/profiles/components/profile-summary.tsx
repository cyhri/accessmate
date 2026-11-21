"use client";

import React from "react";
import {
  UserCheck,
  Edit3,
  Sliders,
  Eye,
  Volume2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { UserAccessibilityProfile } from "@/types/profile";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card variant="default" className="border-teal-200/80 bg-linear-to-r from-teal-50/50 via-white to-slate-50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                <UserCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">
                    {profile.name}
                  </CardTitle>
                  <Badge variant="teal" size="sm">
                    {profile.preferredCategory}
                  </Badge>
                  {profile.isDefault && (
                    <Badge variant="navy" size="sm">
                      Active Default
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Last updated {formatDate(profile.updatedAt)} &bull; ID: {profile.id}
                </CardDescription>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit3 className="h-4 w-4" />}
            >
              Edit Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {profile.notes && (
            <p className="text-xs text-slate-600 bg-white/80 p-3 rounded-lg border border-slate-200/80 mb-4 italic">
              &ldquo;{profile.notes}&rdquo;
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
              <div className="text-xs text-slate-500 font-medium">Primary Aid</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {formatAidLabel(profile.mobility.primaryAid)}
              </div>
            </div>

            <div className="rounded-lg bg-teal-50/70 border border-teal-200 p-3 text-center">
              <div className="text-xs text-teal-700 font-medium flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Essential Blockers
              </div>
              <div className="text-lg font-bold text-teal-900 mt-0.5">
                {essential}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-center">
              <div className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Preferred Needs
              </div>
              <div className="text-lg font-bold text-amber-900 mt-0.5">
                {preferred}
              </div>
            </div>

            <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
              <div className="text-xs text-slate-500 font-medium">Temporary Limit</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {profile.temporary.hasTemporaryLimitation ? "Active" : "None"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mobility Constraints */}
        <Card variant="subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-teal-700 mb-0.5">
              <Sliders className="h-4 w-4" aria-hidden="true" />
              <CardTitle className="text-sm">Mobility &amp; Physical Ingress</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Physical boundary thresholds and movement aids.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Step-free access</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.mobility.requiresStepFreeAccess.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Elevator for multi-level</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.mobility.requiresElevatorForLevels.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Handrails on stairs</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.mobility.requiresHandrails.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Accessible restroom</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.mobility.requiresAccessibleRestroom.replace("_", " ")}
              </span>
            </div>

            {/* Threshold specifications */}
            <div className="pt-2">
              <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">
                Physical Tolerance Thresholds
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Max Step Height</span>
                  <span className="font-semibold text-slate-800">
                    {profile.mobility.maxStepHeightCm !== null
                      ? `${profile.mobility.maxStepHeightCm} cm`
                      : "Unconstrained"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Max Ramp Slope</span>
                  <span className="font-semibold text-slate-800">
                    {profile.mobility.maxRampSlopePercent !== null
                      ? `${profile.mobility.maxRampSlopePercent}%`
                      : "Unconstrained"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Min Doorway Width</span>
                  <span className="font-semibold text-slate-800">
                    {profile.mobility.minDoorwayWidthCm !== null
                      ? `${profile.mobility.minDoorwayWidthCm} cm`
                      : "Standard"}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Max Continuous Walk</span>
                  <span className="font-semibold text-slate-800">
                    {profile.mobility.maxWalkingDistanceMeters !== null
                      ? `${profile.mobility.maxWalkingDistanceMeters} m`
                      : "Unlimited"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensory & Vision */}
        <Card variant="subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-teal-700 mb-0.5">
              <Eye className="h-4 w-4" aria-hidden="true" />
              <CardTitle className="text-sm">Vision &amp; Sensory Wayfinding</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Sensory thresholds, contrast indicators, and audio/tactile cues.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Tactile ground paving</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.vision.requiresTactileGroundPaving.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Audio wayfinding guidance</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.vision.requiresAudioGuidance.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">High-contrast signage</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.vision.requiresHighContrastSignage.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Braille signage</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.vision.requiresBrailleSignage.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Quieter environments</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.sensory.prefersQuieterEnvironments.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Predictable wayfinding</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.sensory.requiresPredictableWayfinding.replace("_", " ")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Hearing & Communication */}
        <Card variant="subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-teal-700 mb-0.5">
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <CardTitle className="text-sm">Hearing &amp; Communication</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Visual emergency alerts and assistive listening infrastructure.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Visual announcements &amp; displays</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.hearing.requiresVisualAnnouncements.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Visual emergency strobe alerts</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.hearing.requiresVisualEmergencyAlerts.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Written instructions &amp; captions</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.hearing.requiresWrittenInstructions.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Hearing induction loop (T-coil)</span>
              <span className="font-medium text-slate-900 capitalize">
                {profile.hearing.requiresHearingLoop.replace("_", " ")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Temporary Limitation */}
        <Card variant="subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-teal-700 mb-0.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <CardTitle className="text-sm">Temporary Limitations &amp; Recovery</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Time-bound recovery conditions, acute injuries, or post-surgery restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {profile.temporary.hasTemporaryLimitation ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="font-medium">Active Temporary Condition</div>
                  <div className="text-[11px] mt-0.5 text-amber-800">
                    {profile.temporary.description || "Active temporary mobility constraint recorded."}
                  </div>
                  {profile.temporary.expectedDurationDays && (
                    <div className="text-[11px] font-semibold mt-1">
                      Expected recovery: ~{profile.temporary.expectedDurationDays} days
                    </div>
                  )}
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Stair climbing difficulty</span>
                  <span className="font-medium text-slate-900">
                    {profile.temporary.difficultyUsingStairs ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Temporary crutches in use</span>
                  <span className="font-medium text-slate-900">
                    {profile.temporary.temporaryUseOfCrutches ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-center">
                <Sparkles className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                No active temporary limitation or injury recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
