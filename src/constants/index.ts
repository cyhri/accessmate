/**
 * Domain Constants
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

/**
 * Primary accessibility requirement dimensions supported by the ACCESSMATE model.
 */
export const ACCESSIBILITY_DIMENSIONS = [
  "mobility",
  "vision",
  "hearing",
  "sensory_cognitive",
  "stamina_endurance",
] as const;

export type AccessibilityDimension = (typeof ACCESSIBILITY_DIMENSIONS)[number];

/**
 * Preference / Requirement importance levels for personalized accessibility profiles.
 */
export const REQUIREMENT_LEVELS = {
  ESSENTIAL: "essential",       // Must-have blocker if missing
  PREFERRED: "preferred",       // Nice-to-have, creates minor friction if missing
  NOT_REQUIRED: "not_required", // Irrelevant or not needed for this user
} as const;

export type RequirementLevel = (typeof REQUIREMENT_LEVELS)[keyof typeof REQUIREMENT_LEVELS];

/**
 * Evidence and confidence statuses for place accessibility facts.
 */
export const EVIDENCE_STATUSES = {
  VERIFIED: "verified",             // Physical on-site audit with measurement
  USER_REPORTED: "user_reported",   // Community / traveler submission
  UNVERIFIED: "unverified",         // Unconfirmed claim or vendor promotional info
  UNKNOWN: "unknown",               // Missing or uncollected data (Never assume available or unavailable)
  NOT_APPLICABLE: "not_applicable", // Does not apply (e.g. elevator in single-floor building)
} as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[keyof typeof EVIDENCE_STATUSES];

/**
 * Legacy evidence levels mapping for backwards compatibility.
 */
export const EVIDENCE_LEVELS = {
  VERIFIED_AUDIT: "verified_audit",
  OFFICIAL_FACILITY_DATA: "official_facility_data",
  COMMUNITY_REPORTED: "community_reported",
  INFERRED_HEURISTIC: "inferred_heuristic",
  UNKNOWN: "unknown",
} as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[keyof typeof EVIDENCE_LEVELS];

/**
 * Decision-support compatibility outcomes.
 */
export const COMPATIBILITY_STATUSES = {
  COMPATIBLE: "compatible",
  PARTIALLY_COMPATIBLE: "partially_compatible",
  INCOMPATIBLE: "incompatible",
  INSUFFICIENT_DATA: "insufficient_data",
} as const;

export type CompatibilityStatus =
  (typeof COMPATIBILITY_STATUSES)[keyof typeof COMPATIBILITY_STATUSES];

/**
 * Severity grading for detected accessibility barriers.
 */
export const BARRIER_SEVERITIES = {
  CRITICAL: "critical", // Total blocker (e.g., flight of stairs with no ramp or lift for power wheelchair)
  HIGH: "high",         // Severe difficulty (e.g., very heavy manual door, steep incline)
  MEDIUM: "medium",     // Moderate barrier (e.g., gravel path, poor contrast signage)
  LOW: "low",           // Minor inconvenience
  INFO: "info",         // Informational note
} as const;

export type BarrierSeverity = (typeof BARRIER_SEVERITIES)[keyof typeof BARRIER_SEVERITIES];

/**
 * Standard building types recognized by the ACCESSMATE assessment module.
 */
export const BUILDING_TYPES = [
  { value: "educational", label: "Educational Institution (School, University)" },
  { value: "healthcare", label: "Hospital or Healthcare Facility" },
  { value: "shopping", label: "Shopping Centre or Retail Complex" },
  { value: "government", label: "Government Building or Civic Centre" },
  { value: "office", label: "Office or Commercial Workplace" },
  { value: "restaurant", label: "Restaurant, Café or Food Venue" },
  { value: "public_facility", label: "Public Library, Museum, or Transit Station" },
  { value: "other", label: "Other Built Facility" },
] as const;

export type BuildingType = (typeof BUILDING_TYPES)[number]["value"];

/**
 * Project Roadmap Phases
 */
export const PROJECT_PHASES = [
  {
    phase: 1,
    name: "Foundation & Architecture",
    description: "Technology stack setup, folder structure, core type contracts, styling, and CI-ready lint/build baseline.",
    status: "completed",
  },
  {
    phase: 2,
    name: "Application Shell & Design System",
    description: "Responsive layouts, deep navy/teal design tokens, accessible component library, and shell navigation.",
    status: "completed",
  },
  {
    phase: 3,
    name: "Profile & Assessment Modules",
    description: "Personalized accessibility criteria management, place audits, and structured evidence capture.",
    status: "active",
  },
  {
    phase: 4,
    name: "Expert System Inference Engine",
    description: "Rule evaluation, working memory, conflict resolution, barrier detection, and explainable decision traces.",
    status: "upcoming",
  },
  {
    phase: 5,
    name: "Routing & Spatial Decision Support",
    description: "Terrain barrier avoidance, route compatibility analysis, and spatial mapping overlays.",
    status: "upcoming",
  },
] as const;
