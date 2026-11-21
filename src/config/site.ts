/**
 * Site & Application Configuration
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly description?: string;
  readonly status: "ready" | "upcoming";
  readonly phase: string;
  readonly iconName:
    | "LayoutDashboard"
    | "UserCheck"
    | "Navigation"
    | "Building2"
    | "MessageSquareWarning"
    | "Settings";
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
  version: "0.2.0",
  phase: "Phase 2: Professional Application Shell & Design System",
  year: 2026,
  author: "ACCESSMATE Engineering Team",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/cyhri/accessmate",
    docs: "/#architecture",
  },
  mainNav: [
    {
      title: "Dashboard",
      href: "/",
      description: "Platform overview, core reasoning pillars, and module implementation status",
      status: "ready",
      phase: "Phase 1 & 2",
      iconName: "LayoutDashboard",
    },
    {
      title: "Accessibility Profile",
      href: "/profile",
      description: "Manage individual accessibility criteria (mobility, visual, sensory, auditory, stamina)",
      status: "upcoming",
      phase: "Phase 3",
      iconName: "UserCheck",
    },
    {
      title: "Route Assessment",
      href: "/routes",
      description: "Micro-routing, surface barrier avoidance, slope grading, and transit accessibility",
      status: "upcoming",
      phase: "Phase 5",
      iconName: "Navigation",
    },
    {
      title: "Building Assessment",
      href: "/assessment",
      description: "Structured built-environment accessibility audits and physical feature data",
      status: "upcoming",
      phase: "Phase 3",
      iconName: "Building2",
    },
    {
      title: "Community Reports",
      href: "/reports",
      description: "Crowd-sourced temporary obstacle reports, broken elevator alerts, and evidence scoring",
      status: "upcoming",
      phase: "Future Phase",
      iconName: "MessageSquareWarning",
    },
    {
      title: "Settings",
      href: "/settings",
      description: "Display contrast, reduced-motion preferences, and system diagnostic metadata",
      status: "ready",
      phase: "Phase 2",
      iconName: "Settings",
    },
  ],
} as const;
