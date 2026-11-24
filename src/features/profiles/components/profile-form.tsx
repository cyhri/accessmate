"use client";

import React, { useState } from "react";
import {
  Save,
  RotateCcw,
  Sliders,
  Eye,
  Volume2,
  Sparkles,
  Clock,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import type { UserAccessibilityProfile, MobilityAid } from "@/types/profile";
import { RequirementSelector } from "./requirement-selector";
import { PROFILE_PRESETS } from "../profile-presets";
import { getDefaultProfile } from "@/lib/storage/profile-storage";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export interface ProfileFormProps {
  readonly initialProfile: UserAccessibilityProfile;
  readonly onSave: (profile: UserAccessibilityProfile) => void;
  readonly onCancel?: () => void;
}

const MOBILITY_AID_OPTIONS: { readonly value: MobilityAid; readonly label: string }[] = [
  { value: "none", label: "None / Ambulatory without aid" },
  { value: "manual_wheelchair", label: "Manual Wheelchair" },
  { value: "power_wheelchair", label: "Power / Motorized Wheelchair" },
  { value: "mobility_scooter", label: "Mobility Scooter" },
  { value: "crutches", label: "Crutches (Axillary or Forearm)" },
  { value: "walker", label: "Rollator / Walking Frame" },
  { value: "walking_cane", label: "Walking Cane / Quad Cane" },
  { value: "guide_dog", label: "Guide Dog / Service Animal" },
];

export function ProfileForm({ initialProfile, onSave, onCancel }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState("");

  const handleNameChange = (name: string) => {
    setProfile((prev) => ({ ...prev, name }));
    if (errors.name) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PROFILE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setProfile((prev) => ({
      ...prev,
      name: preset.data.name,
      preferredCategory: preset.data.preferredCategory,
      notes: preset.data.notes,
      mobility: { ...preset.data.mobility },
      vision: { ...preset.data.vision },
      hearing: { ...preset.data.hearing },
      sensory: { ...preset.data.sensory },
      temporary: { ...preset.data.temporary },
    }));
    setSelectedPresetId(presetId);
    setErrors({});
  };

  const handleResetDefault = () => {
    const cleanDefault = getDefaultProfile();
    setProfile({
      ...cleanDefault,
      id: profile.id,
      createdAt: profile.createdAt,
    });
    setErrors({});
    setSelectedPresetId("");
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!profile.name.trim()) {
      nextErrors.name = "Profile name is required.";
    }

    // Number validations
    if (profile.mobility.maxStepHeightCm !== null && profile.mobility.maxStepHeightCm < 0) {
      nextErrors.maxStepHeightCm = "Step height cannot be negative.";
    }
    if (profile.mobility.maxRampSlopePercent !== null && (profile.mobility.maxRampSlopePercent < 0 || profile.mobility.maxRampSlopePercent > 45)) {
      nextErrors.maxRampSlopePercent = "Slope must be between 0% and 45%.";
    }
    if (profile.mobility.minDoorwayWidthCm !== null && profile.mobility.minDoorwayWidthCm < 30) {
      nextErrors.minDoorwayWidthCm = "Doorway width must be at least 30 cm.";
    }
    if (profile.mobility.maxWalkingDistanceMeters !== null && profile.mobility.maxWalkingDistanceMeters < 0) {
      nextErrors.maxWalkingDistanceMeters = "Walking distance cannot be negative.";
    }
    if (profile.temporary.expectedDurationDays !== null && profile.temporary.expectedDurationDays < 1) {
      nextErrors.expectedDurationDays = "Duration must be at least 1 day.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {savedSuccess && (
        <Alert variant="success" icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}>
          <div className="font-semibold text-emerald-900">Profile saved successfully!</div>
          <div className="text-xs text-emerald-800">
            Your personalized accessibility preferences and physical thresholds have been persisted to local storage.
          </div>
        </Alert>
      )}

      {/* Profile Header & Persona Preset Bar */}
      <div className="rounded-lg border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
              Edit Accessibility Profile
            </h2>
            <p className="text-xs text-zinc-500">
              Customize functional mobility limits, sensory tolerances, and assistive communication requirements.
            </p>
          </div>

          {/* Quick Persona Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 shrink-0 hidden sm:inline">
              <Bookmark className="h-3.5 w-3.5 inline mr-1 text-teal-600" /> Quick Persona:
            </span>
            <select
              value={selectedPresetId}
              onChange={(e) => handleLoadPreset(e.target.value)}
              aria-label="Load pre-configured accessibility persona preset"
              className="text-xs rounded-lg border border-zinc-300 bg-zinc-50 py-1.5 pl-2.5 pr-8 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="">Load Preset Template...</option>
              {PROFILE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Profile Name"
            required
            value={profile.name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={errors.name}
            placeholder="e.g. Primary Daily Profile"
          />

          <Input
            label="Persona / Category Description"
            value={profile.preferredCategory}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, preferredCategory: e.target.value }))
            }
            placeholder="e.g. Wheelchair Mobility, Low Vision"
          />

          <div className="sm:col-span-2">
            <Input
              label="Personal Travel Notes & Context"
              value={profile.notes ?? ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="e.g. Requires automated doors due to reduced upper body grip strength."
              helperText="Additional qualitative context for decision explanation."
            />
          </div>
        </div>
      </div>

      {/* Section 1: Mobility Aid & Physical Capabilities */}
      <CollapsibleSection
        title="Mobility Aid & Physical Ingress"
        description="Physical boundary conditions, step height tolerance, doorway width clearances, and ramp slope thresholds."
        icon={<Sliders className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Mobility Aid"
              value={profile.mobility.primaryAid}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  mobility: {
                    ...prev.mobility,
                    primaryAid: e.target.value as MobilityAid,
                    usesWheelchair:
                      e.target.value === "manual_wheelchair" ||
                      e.target.value === "power_wheelchair",
                    usesMobilityScooter: e.target.value === "mobility_scooter",
                    usesCrutchesOrWalkingAid:
                      e.target.value === "crutches" || e.target.value === "walker",
                  },
                }))
              }
              options={MOBILITY_AID_OPTIONS}
            />

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-medium text-zinc-700 block">
                Functional Mobility Characteristics
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-100">
                  <input
                    type="checkbox"
                    checked={profile.mobility.difficultyClimbingStairs}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        mobility: {
                          ...prev.mobility,
                          difficultyClimbingStairs: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                  />
                  Difficulty climbing stairs
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-100">
                  <input
                    type="checkbox"
                    checked={profile.mobility.usesWheelchair}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        mobility: {
                          ...prev.mobility,
                          usesWheelchair: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                  />
                  Uses wheelchair
                </label>
              </div>
            </div>
          </div>

          {/* Requirement Selectors for Environmental Features */}
          <div className="border-t border-zinc-100 pt-3">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
              Environmental Feature Requirement Levels
            </h4>
            <RequirementSelector
              label="Step-Free Access"
              description="Zero vertical step threshold at facility entrance or level entry."
              value={profile.mobility.requiresStepFreeAccess}
              onChange={(next) =>
                setProfile((prev) => ({
                  ...prev,
                  mobility: { ...prev.mobility, requiresStepFreeAccess: next },
                }))
              }
            />
            <RequirementSelector
              label="Sturdy Handrails on Steps & Ramps"
              description="Continuous bilateral handrails on any changes of level."
              value={profile.mobility.requiresHandrails}
              onChange={(next) =>
                setProfile((prev) => ({
                  ...prev,
                  mobility: { ...prev.mobility, requiresHandrails: next },
                }))
              }
            />
            <RequirementSelector
              label="Elevator for Multi-Level Facilities"
              description="Operational elevator or vertical lift required whenever venue has multiple floors."
              value={profile.mobility.requiresElevatorForLevels}
              onChange={(next) =>
                setProfile((prev) => ({
                  ...prev,
                  mobility: { ...prev.mobility, requiresElevatorForLevels: next },
                }))
              }
            />
            <RequirementSelector
              label="Accessible Restroom Facility"
              description="ADA / Part M compliant sanitary facility with grab bars and turning space."
              value={profile.mobility.requiresAccessibleRestroom}
              onChange={(next) =>
                setProfile((prev) => ({
                  ...prev,
                  mobility: { ...prev.mobility, requiresAccessibleRestroom: next },
                }))
              }
            />
            <RequirementSelector
              label="Frequent Rest Seating Points"
              description="Seating points or benches along corridors and paths."
              value={profile.mobility.requiresFrequentRestStops}
              onChange={(next) =>
                setProfile((prev) => ({
                  ...prev,
                  mobility: { ...prev.mobility, requiresFrequentRestStops: next },
                }))
              }
            />
          </div>

          {/* Numeric Threshold Constraints */}
          <div className="border-t border-zinc-100 pt-3">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2">
              Quantitative Physical Threshold Constraints
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                label="Max Tolerable Step Height (cm)"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 0 for wheelchair, 15 for cane"
                value={profile.mobility.maxStepHeightCm ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    mobility: {
                      ...prev.mobility,
                      maxStepHeightCm: e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                error={errors.maxStepHeightCm}
                helperText="Leave empty if unconstrained"
              />

              <Input
                label="Max Ramp Slope Incline (%)"
                type="number"
                min="0"
                max="45"
                placeholder="e.g. 6% (1:16.6), 8% (1:12)"
                value={profile.mobility.maxRampSlopePercent ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    mobility: {
                      ...prev.mobility,
                      maxRampSlopePercent: e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                error={errors.maxRampSlopePercent}
                helperText="Leave empty if unconstrained"
              />

              <Input
                label="Min Doorway Clear Width (cm)"
                type="number"
                min="30"
                max="300"
                placeholder="e.g. 80cm standard, 85cm wide"
                value={profile.mobility.minDoorwayWidthCm ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    mobility: {
                      ...prev.mobility,
                      minDoorwayWidthCm: e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                error={errors.minDoorwayWidthCm}
                helperText="Clear width required for passage"
              />

              <Input
                label="Max Continuous Walk (meters)"
                type="number"
                min="0"
                placeholder="e.g. 150m before rest needed"
                value={profile.mobility.maxWalkingDistanceMeters ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    mobility: {
                      ...prev.mobility,
                      maxWalkingDistanceMeters:
                        e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                error={errors.maxWalkingDistanceMeters}
                helperText="Endurance limit before rest stop"
              />

              <Input
                label="Rest Stop Frequency (meters)"
                type="number"
                min="0"
                placeholder="e.g. 50m intervals"
                value={profile.mobility.restStopIntervalMeters ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    mobility: {
                      ...prev.mobility,
                      restStopIntervalMeters:
                        e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                helperText="Desired spacing between benches"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Vision & Wayfinding */}
      <CollapsibleSection
        title="Vision & Spatial Wayfinding"
        description="Tactile indicators, acoustic wayfinding guidance, high-contrast visual cues, and braille signage."
        icon={<Eye className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 pb-2 border-b border-zinc-100">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-100">
              <input
                type="checkbox"
                checked={profile.vision.hasLowVision}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    vision: { ...prev.vision, hasLowVision: e.target.checked },
                  }))
                }
                className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
              />
              Has Low Vision / Partial Sight
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-100">
              <input
                type="checkbox"
                checked={profile.vision.hasBlindness}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    vision: { ...prev.vision, hasBlindness: e.target.checked },
                  }))
                }
                className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
              />
              Blind / Non-Visual Traveler
            </label>
          </div>

          <RequirementSelector
            label="Tactile Ground Surface Indicators (Paving)"
            description="Blister warning studs and directional guidance ribs on walkways."
            value={profile.vision.requiresTactileGroundPaving}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                vision: { ...prev.vision, requiresTactileGroundPaving: next },
              }))
            }
          />
          <RequirementSelector
            label="Audio Announcements & Spoken Guidance"
            description="Audible floor callouts in lifts and spoken route directions."
            value={profile.vision.requiresAudioGuidance}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                vision: { ...prev.vision, requiresAudioGuidance: next },
              }))
            }
          />
          <RequirementSelector
            label="High-Contrast Visual Signage"
            description="Signage with compliant 70%+ luminance contrast and large typography."
            value={profile.vision.requiresHighContrastSignage}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                vision: { ...prev.vision, requiresHighContrastSignage: next },
              }))
            }
          />
          <RequirementSelector
            label="Clearly Identifiable Entrances"
            description="Entrances with distinct visual demarcation and contrasting door frames."
            value={profile.vision.requiresIdentifiableEntrances}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                vision: { ...prev.vision, requiresIdentifiableEntrances: next },
              }))
            }
          />
          <RequirementSelector
            label="Obstacle-Free Corridors & Pathways"
            description="Absence of protruding hazards, sandwich boards, or low overhead obstructions."
            value={profile.vision.requiresObstacleFreePaths}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                vision: { ...prev.vision, requiresObstacleFreePaths: next },
              }))
            }
          />
          <RequirementSelector
            label="Braille & Raised Tactile Signage"
            description="Grade 2 Braille and raised relief lettering on lift panels and room doors."
            value={profile.vision.requiresBrailleSignage}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                vision: { ...prev.vision, requiresBrailleSignage: next },
              }))
            }
          />
        </div>
      </CollapsibleSection>

      {/* Section 3: Hearing & Communication */}
      <CollapsibleSection
        title="Hearing & Communication"
        description="Visual emergency warnings, captioning, information displays, and induction hearing loops."
        icon={<Volume2 className="h-5 w-5" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="pb-2 border-b border-zinc-100">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-100">
              <input
                type="checkbox"
                checked={profile.hearing.isDeafOrHardOfHearing}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    hearing: {
                      ...prev.hearing,
                      isDeafOrHardOfHearing: e.target.checked,
                    },
                  }))
                }
                className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
              />
              Deaf or Hard-of-Hearing Traveler
            </label>
          </div>

          <RequirementSelector
            label="Visual Real-Time Announcements"
            description="Digital screens displaying transit arrivals, delay notices, and announcements."
            value={profile.hearing.requiresVisualAnnouncements}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                hearing: { ...prev.hearing, requiresVisualAnnouncements: next },
              }))
            }
          />
          <RequirementSelector
            label="Visual Emergency Alarms (Strobe Lights)"
            description="Flashing strobe beacons accompanying audible fire and evacuation alarms."
            value={profile.hearing.requiresVisualEmergencyAlerts}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                hearing: { ...prev.hearing, requiresVisualEmergencyAlerts: next },
              }))
            }
          />
          <RequirementSelector
            label="Written Instructions & Captioned Media"
            description="Printed service guides, maps, and captioned informational video displays."
            value={profile.hearing.requiresWrittenInstructions}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                hearing: { ...prev.hearing, requiresWrittenInstructions: next },
              }))
            }
          />
          <RequirementSelector
            label="Hearing Induction Loop (T-Coil / Telecoil)"
            description="Installed induction loop systems at reception counters and meeting halls."
            value={profile.hearing.requiresHearingLoop}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                hearing: { ...prev.hearing, requiresHearingLoop: next },
              }))
            }
          />
        </div>
      </CollapsibleSection>

      {/* Section 4: Sensory & Neurodivergent Requirements */}
      <CollapsibleSection
        title="Sensory Sensitivities & Wayfinding"
        description="Environmental noise tolerance, crowd density, predictable navigation, and quiet spaces."
        icon={<Sparkles className="h-5 w-5" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <RequirementSelector
            label="Prefers Quieter Low-Acoustic Spaces"
            description="Avoids excessively reverberant halls, continuous loud alarms, or echo chambers."
            value={profile.sensory.prefersQuieterEnvironments}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                sensory: { ...prev.sensory, prefersQuieterEnvironments: next },
              }))
            }
          />
          <RequirementSelector
            label="Predictable Layout & Clear Wayfinding"
            description="Straightforward spatial layouts without disorienting mirror corridors or blind turns."
            value={profile.sensory.requiresPredictableWayfinding}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                sensory: { ...prev.sensory, requiresPredictableWayfinding: next },
              }))
            }
          />
          <RequirementSelector
            label="Reduced Sensory Stimulation"
            description="Filters out spaces with strobing/flickering fluorescent bulbs or intense perfumes."
            value={profile.sensory.requiresReducedSensoryStimulation}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                sensory: { ...prev.sensory, requiresReducedSensoryStimulation: next },
              }))
            }
          />
          <RequirementSelector
            label="Clearly Marked Escape & Rest Routes"
            description="Visible egress paths leading to low-sensory recharge areas."
            value={profile.sensory.prefersClearlyMarkedRoutes}
            onChange={(next) =>
              setProfile((prev) => ({
                ...prev,
                sensory: { ...prev.sensory, prefersClearlyMarkedRoutes: next },
              }))
            }
          />
        </div>
      </CollapsibleSection>

      {/* Section 5: Temporary Limitations */}
      <CollapsibleSection
        title="Temporary Limitations & Acute Conditions"
        description="Post-surgical recovery, sports injury, sprains, or temporary walking aids with defined durations."
        icon={<Clock className="h-5 w-5" />}
        defaultOpen={profile.temporary.hasTemporaryLimitation}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <input
              type="checkbox"
              id="hasTemporaryLimitation"
              checked={profile.temporary.hasTemporaryLimitation}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  temporary: {
                    ...prev.temporary,
                    hasTemporaryLimitation: e.target.checked,
                  },
                }))
              }
              className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
            />
            <label
              htmlFor="hasTemporaryLimitation"
              className="text-sm font-semibold text-zinc-800 cursor-pointer"
            >
              Activate Temporary Limitation Overlay
            </label>
          </div>

          {profile.temporary.hasTemporaryLimitation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-lg border border-amber-200/80">
              <div className="sm:col-span-2">
                <Input
                  label="Description of Temporary Limitation"
                  value={profile.temporary.description}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      temporary: { ...prev.temporary, description: e.target.value },
                    }))
                  }
                  placeholder="e.g. Fractured ankle in plaster cast; crutches required."
                />
              </div>

              <Input
                label="Estimated Duration (Days Remaining)"
                type="number"
                min="1"
                max="365"
                value={profile.temporary.expectedDurationDays ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    temporary: {
                      ...prev.temporary,
                      expectedDurationDays:
                        e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                error={errors.expectedDurationDays}
                placeholder="e.g. 30"
              />

              <div className="flex flex-col gap-2 pt-2">
                <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.temporary.temporaryUseOfCrutches}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        temporary: {
                          ...prev.temporary,
                          temporaryUseOfCrutches: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-zinc-300 text-teal-600"
                  />
                  Temporary use of crutches or cane
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.temporary.difficultyUsingStairs}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        temporary: {
                          ...prev.temporary,
                          difficultyUsingStairs: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-zinc-300 text-teal-600"
                  />
                  Temporarily cannot climb stairs
                </label>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetDefault}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Reset to Blank Default
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Save Accessibility Profile
          </Button>
        </div>
      </div>
    </form>
  );
}
