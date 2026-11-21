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
 * Confidence and evidence levels for place accessibility facts.
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
    status: "active",
  },
  {
    phase: 3,
    name: "Profile & Assessment Modules",
    description: "Personalized accessibility criteria management, place audits, and structured evidence capture.",
    status: "upcoming",
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
