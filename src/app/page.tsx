"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Navigation,
  UserCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Sparkles,
  ChevronRight,
  Building2,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  profileRepository,
  getDefaultProfile,
  PROFILE_PRESETS,
  type ProfilePreset,
} from "@/features/profiles";
import { assessmentRepository, SAMPLE_BUILDING_ASSESSMENTS } from "@/features/assessment";
import { InferenceEngine, type ExpertEvaluationResult } from "@/features/expert-system";
import type { UserAccessibilityProfile } from "@/types/profile";
import type { BuildingAssessmentRecord } from "@/types/assessment";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(getDefaultProfile);
  const [assessments, setAssessments] = useState<BuildingAssessmentRecord[]>(SAMPLE_BUILDING_ASSESSMENTS);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    SAMPLE_BUILDING_ASSESSMENTS[0]?.id ?? ""
  );

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(profileRepository.getProfile() ?? getDefaultProfile());
      const updatedList = assessmentRepository.getAssessments();
      setAssessments(updatedList);
      if (updatedList.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(updatedList[0]?.id ?? "");
      }
    };
    handleUpdate();
    window.addEventListener("accessmate:profile-updated", handleUpdate);
    window.addEventListener("accessmate:assessments-updated", handleUpdate);
    return () => {
      window.removeEventListener("accessmate:profile-updated", handleUpdate);
      window.removeEventListener("accessmate:assessments-updated", handleUpdate);
    };
  }, [selectedBuildingId]);

  const selectedVenue = assessments.find((a) => a.id === selectedBuildingId) ?? assessments[0];

  // Derived evaluation result computed during render
  const quickResult: ExpertEvaluationResult | null =
    profile && selectedVenue ? InferenceEngine.evaluate(profile, selectedVenue) : null;

  const handleSelectPreset = (preset: ProfilePreset) => {
    const updated: UserAccessibilityProfile = {
      id: preset.id,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...preset.data,
    };
    profileRepository.saveProfile(updated);
    setProfile(updated);
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "suitable":
        return <Badge variant="success" size="sm" dot>Fully Compatible</Badge>;
      case "suitable_with_arrangements":
        return <Badge variant="teal" size="sm" dot>Compatible with Arrangements</Badge>;
      case "difficult":
        return <Badge variant="warning" size="sm" dot>Micro-Barriers Present</Badge>;
      case "unsuitable":
        return <Badge variant="error" size="sm" dot>Critical Barriers Detected</Badge>;
      default:
        return <Badge variant="neutral" size="sm" dot>Incomplete Evidence</Badge>;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 pb-20"
    >
      {/* 1. HERO CALL-TO-ACTION (Apple/Linear Obsidian Hero Banner) */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-[#111110] text-white p-7 sm:p-10 shadow-2xl border border-white/[0.08]"
      >
        {/* Subtle Ambient Light Gradients */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-teal-300 border border-white/10">
            <Sparkles className="h-3 w-3 text-teal-400" />
            <span>Personalized Mobility Decision Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display leading-[1.1]">
            Navigate spaces without unseen barriers.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
            ACCESSMATE replaces generic &ldquo;accessible&rdquo; labels by cross-referencing your exact physical tolerances&mdash;curb heights, doorway clearances, and slope grades&mdash;against real architectural audits.
          </p>

          {/* High-Converting Tactical Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link href="/routes">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Navigation className="h-4 w-4 text-zinc-950" />
                <span>Plan Accessible Route</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>

            <Link href="/assessment">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-zinc-300" />
                <span>Audit a Building</span>
              </motion.button>
            </Link>

            <Link href="/profile">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-full text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>Edit Tolerances &rarr;</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 2. THREE CORE ACTION PILLARS (Interactive Feature Cards) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Route Advisor */}
        <Link href="/routes" className="group">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full p-5 rounded-2xl border border-black/[0.06] bg-white hover:border-black/[0.15] hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Navigation className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111110] font-display">
                Apple Maps Route Planner
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Map-first pedestrian routing avoiding steep street inclines, cobblestone pavements, and physical steps.
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 2: Expert Diagnostics */}
        <Link href="/inference" className="group">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full p-5 rounded-2xl border border-black/[0.06] bg-white hover:border-black/[0.15] hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111110] font-display">
                Expert Diagnostic Reasoning
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                24 forward-chaining rules checking entrance stairs, elevator operational status, and doorway clearance.
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 3: Community Hazard Stream */}
        <Link href="/reports" className="group">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full p-5 rounded-2xl border border-black/[0.06] bg-white hover:border-black/[0.15] hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111110] font-display">
                Real-Time Hazard Feed
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Peer-verified reports for broken elevators, temporary scaffolding, and blocked accessible curbs.
              </p>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* 3. ACTIVE PROFILE TOLERANCE STRIP */}
      <motion.section
        variants={itemVariants}
        className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#111110]">{profile.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium capitalize">
                  {profile.preferredCategory.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Active criteria for venue clearance checks and pedestrian path calculation
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Modify Tolerances</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tolerance Inset Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
              Step Tolerance
            </span>
            <span className="text-base font-bold text-[#111110] font-mono tabular-nums">
              {profile.mobility.maxStepHeightCm ?? 0} cm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
              Min Door Clearance
            </span>
            <span className="text-base font-bold text-[#111110] font-mono tabular-nums">
              {profile.mobility.minDoorwayWidthCm ?? 80} cm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
              Max Ramp Grade
            </span>
            <span className="text-base font-bold text-[#111110] font-mono tabular-nums">
              {profile.mobility.maxRampSlopePercent ?? 6}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50/80 border border-black/[0.04] space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
              Max Distance
            </span>
            <span className="text-base font-bold text-[#111110] font-mono tabular-nums">
              {profile.mobility.maxWalkingDistanceMeters ? `${profile.mobility.maxWalkingDistanceMeters}m` : "Unlimited"}
            </span>
          </div>
        </div>

        {/* Quick Persona Switcher Chips */}
        <div className="pt-2 border-t border-black/[0.04] flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-400 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-teal-600" />
            Switch profile preset:
          </span>
          {PROFILE_PRESETS.map((preset) => {
            const isSelected = profile.id === preset.id;
            return (
              <motion.button
                key={preset.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectPreset(preset)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-[#111110] text-white font-medium shadow-2xs"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                )}
              >
                {preset.name}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* 4. LIVE VENUE COMPATIBILITY INSPECTOR */}
      <motion.section
        variants={itemVariants}
        className="rounded-2xl border border-black/[0.06] bg-white shadow-xs overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-black/[0.04] bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-zinc-700" />
            <h2 className="text-sm font-semibold text-[#111110]">
              Instant Venue Compatibility Inspector
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="inspector-venue-select" className="text-xs text-zinc-500 font-medium sr-only">
              Select Venue
            </label>
            <select
              id="inspector-venue-select"
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-black/[0.08] bg-white py-1.5 pl-3 pr-8 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs cursor-pointer"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.general.name} ({a.general.buildingType.replace(/_/g, " ")})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inspector Evaluation Body */}
        {quickResult && selectedVenue ? (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  {getOutcomeBadge(quickResult.overallOutcome)}
                  <span className="text-xs font-mono text-zinc-400">
                    {quickResult.rulesFiredCount} rule{quickResult.rulesFiredCount === 1 ? "" : "s"} evaluated
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#111110] font-display pt-1">
                  {quickResult.outcomeTitle}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {quickResult.outcomeDescription}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/inference">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111110] text-white text-xs font-medium hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Explain Reasoning</span>
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Inset Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04] text-center">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">
                  Needs Evaluated
                </span>
                <span className="text-base font-bold text-[#111110] font-mono tabular-nums">
                  {quickResult.essentialRequirements.total}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/50 text-center">
                <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider block">
                  Satisfied
                </span>
                <span className="text-base font-bold text-emerald-800 font-mono tabular-nums">
                  {quickResult.essentialRequirements.satisfiedCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50 text-center">
                <span className="text-[10px] uppercase font-semibold text-rose-800 tracking-wider block">
                  Barriers
                </span>
                <span className="text-base font-bold text-rose-800 font-mono tabular-nums">
                  {quickResult.barriers.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/50 text-center">
                <span className="text-[10px] uppercase font-semibold text-amber-800 tracking-wider block">
                  Info Gaps
                </span>
                <span className="text-base font-bold text-amber-800 font-mono tabular-nums">
                  {quickResult.informationGaps.length}
                </span>
              </div>
            </div>

            {/* Key Barrier or Strength Summary */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {quickResult.barriers.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/70 space-y-1">
                  <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-700" />
                    Primary Identified Barrier:
                  </span>
                  <p className="text-zinc-700 leading-relaxed">
                    {quickResult.barriers[0]?.title}: {quickResult.barriers[0]?.description}
                  </p>
                </div>
              )}

              {quickResult.strengths.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    Verified Strength:
                  </span>
                  <p className="text-zinc-700 leading-relaxed">
                    {quickResult.strengths[0]?.title}: {quickResult.strengths[0]?.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </motion.section>

      {/* 5. AUDITED VENUES DIRECTORY */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111110]">
              Audited Venues ({assessments.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Structured environmental audits with verified measurements.
            </p>
          </div>

          <Link
            href="/assessment"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>All Facilities</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assessments.map((venue) => {
            const hasStepFree = venue.entrance.stepFreeAccess.value === true;
            const hasElevator = venue.internalMovement.elevatorAvailable.value === true;
            const hasRestroom = venue.restroom.accessibleRestroomAvailable.value === true;
            const isCurrent = venue.id === selectedBuildingId;

            return (
              <motion.div
                key={venue.id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "rounded-2xl border p-4 bg-white transition-all space-y-3 flex flex-col justify-between shadow-xs",
                  isCurrent
                    ? "border-[#111110] ring-1 ring-[#111110]"
                    : "border-black/[0.06] hover:border-black/[0.12]"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-medium">
                      {venue.general.buildingType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                      {venue.general.floorsCount} {venue.general.floorsCount === 1 ? "fl" : "fls"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#111110] font-display leading-snug">
                    {venue.general.name}
                  </h3>

                  <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{venue.general.address}</span>
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-medium",
                      hasStepFree
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
                        : "bg-amber-50 text-amber-800 border border-amber-200/50"
                    )}>
                      {hasStepFree ? "Step-Free" : "Entrance Steps"}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-medium",
                      hasElevator
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
                        : "bg-zinc-100 text-zinc-600"
                    )}>
                      {hasElevator ? "Elevator" : "No Lift"}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-medium",
                      hasRestroom
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
                        : "bg-zinc-100 text-zinc-600"
                    )}>
                      {hasRestroom ? "Accessible WC" : "Standard WC"}
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedBuildingId(venue.id)}
                    className={cn(
                      "w-full text-xs font-semibold py-2 px-3 rounded-xl border transition-all cursor-pointer",
                      isCurrent
                        ? "bg-[#111110] text-white border-[#111110]"
                        : "bg-white border-black/[0.08] hover:bg-zinc-50 text-zinc-800"
                    )}
                  >
                    {isCurrent ? "Currently Inspected" : "Inspect Compatibility"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
