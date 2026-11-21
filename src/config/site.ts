/**
 * Site & Application Configuration
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly description?: string;
  readonly status: "ready" | "planned";
  readonly phase: string;
}

export interface SiteConfig {
  readonly name: string;
  readonly shortName: string;
  readonly tagLine: string;
  readonly description: string;
  readonly version: string;
  readonly phase: string;
  readonly year: number;
  readonly author: string;
  readonly url: string;
  readonly links: {
    readonly github: string;
    readonly docs: string;
  };
  readonly mainNav: readonly NavItem[];
}

export const siteConfig: SiteConfig = {
  name: "ACCESSMATE",
  shortName: "AccessMate",
  tagLine: "Personalized Accessibility & Mobility Decision-Support System",
  description:
    "An expert decision-support platform that evaluates compatibility between individual accessibility requirements and physical built environments or transit paths, identifying barriers with transparent, explainable reasoning.",
  version: "0.1.0",
  phase: "Phase 1: Architecture & Technical Foundation",
  year: 2026,
  author: "ACCESSMATE Engineering Team",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/cyhri/accessmate",
    docs: "/#architecture",
  },
  mainNav: [
    {
      title: "Overview",
      href: "/",
      description: "System overview, decision-support model, and architectural roadmap",
      status: "ready",
      phase: "Phase 1",
    },
    {
      title: "Profiles",
      href: "/profile",
      description: "Manage individual accessibility criteria (mobility, visual, sensory, auditory, stamina)",
      status: "planned",
      phase: "Phase 3",
    },
    {
      title: "Assessments",
      href: "/assessment",
      description: "Structured built-environment accessibility audits and physical feature data",
      status: "planned",
      phase: "Phase 3",
    },
    {
      title: "Inference Engine",
      href: "/inference",
      description: "Rule-based expert system, compatibility matrix, and explainable decision traces",
      status: "planned",
      phase: "Phase 4",
    },
    {
      title: "Route Advisor",
      href: "/routes",
      description: "Accessible route planning, surface barrier avoidance, and transit accessibility",
      status: "planned",
      phase: "Phase 5",
    },
  ],
} as const;
