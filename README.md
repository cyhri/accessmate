# ACCESSMATE — Personalized Accessibility & Mobility Decision-Support System

> **Phase 2: Professional Application Shell & Design System Baseline**  
> An expert decision-support platform designed to evaluate environmental compatibility between individual accessibility requirements and physical built environments or transit paths.

---

## 1. Project Title & Overview

**ACCESSMATE** is a knowledge-based, expert decision-support system developed to assess whether a public building, facility, or journey satisfies an individual's specific accessibility criteria. Rather than reducing accessibility to an oversimplified, binary label ("accessible" vs. "inaccessible"), ACCESSMATE models the complex, multi-dimensional reality of physical barriers, sensory considerations, and individual mobility profiles.

By cross-referencing structured place audits with a user's stated requirements through a forward-chaining rule engine, the system detects physical and environmental barriers, communicates uncertainty, and yields transparent, explainable decision traces.

---

## 2. Problem Statement

Accessibility information in existing municipal and mapping platforms is frequently incomplete, outdated, or collapsed into a single generic rating. However, accessibility is deeply personal and context-dependent:

- A step-free entrance with a heavy manual door benefits a motorized scooter user only if automated door openers or wide clearances exist.
- A person with low vision requires high visual contrast, tactile ground paving, and audible announcements, which standard "wheelchair-accessible" badges completely omit.
- An individual with neurodivergence or sensory processing sensitivities may encounter severe barriers in loud, crowded, or flickering environments even if physical entry is level.
- Out-of-service elevators or restrooms located across inaccessible thresholds frequently turn ostensibly "accessible" buildings into practical dead-ends.

People frequently arrive at destinations only to encounter unannounced, critical barriers that could have been identified in advance. ACCESSMATE bridges this information gap by delivering tailored, explainable compatibility assessments.

---

## 3. Project Objectives

1. **Personalized Compatibility Modeling:** Evaluate specific user capabilities (mobility aids, step tolerance, doorway clearance, lighting, sensory thresholds) against physical facility attributes.
2. **Transparent, Explainable Reasoning:** Provide a complete audit trace of which accessibility rules fired, why a venue is compatible or incompatible, and which environmental facts led to the outcome.
3. **Evidence & Confidence Grading:** Categorize and display the provenance of data (verified audit, official facility submission, community report, heuristic inference, or unknown) so users understand reliability.
4. **Actionable Recommendations:** Suggest concrete next steps (e.g., alternative entrances, staff assistance requirements, or alternative transit corridors) when barriers are identified.
5. **Modular Architecture:** Maintain strict separation between the user interface, knowledge base, inference engine, and spatial routing services to support phased expansion and independent verification.

---

## 4. Design Direction & Design System (Phase 2)

ACCESSMATE features a bespoke, premium SaaS design system created with accessibility, clarity, and trust as primary architectural tenets:

- **Color Palette:**
  - **Deep Navy (`#0f172a` / `#1e293b`):** Grounded, trustworthy primary dark tone for persistent sidebar navigation and high-contrast text.
  - **Teal Accent (`#0d9488` / `#0f766e`):** Purpose-driven primary action and focus indicator color meeting WCAG AA contrast standards.
  - **Subtle Mint (`#f0fdfa` / `#ccfbf1`):** Soft contextual backgrounds, positive callouts, and badge backgrounds.
  - **Soft Off-White (`#f8fafc`):** Application canvas background reducing eye fatigue.
  - **Thin Subtle Borders (`#e2e8f0`):** Structured visual hierarchy without visual clutter.
- **Accessibility & Focus Indicators:**
  - 2px visible teal outline with offset (`focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2`) across every interactive element.
  - Automated operating system `prefers-reduced-motion` detection and disablement of non-essential animations.
  - Standardized semantic HTML landmarks (`<aside>`, `<header>`, `<main id="main-content">`, `<nav>`, `<footer>`) with skip navigation.
- **Iconography:** Consistent, accessible icons powered by `lucide-react`.

---

## 5. Technology Stack

### Core Framework & Runtime
- **Next.js 16 (App Router):** Server-rendered application shell, Partial Prerendering, and static optimization.
- **React 19:** Component model with strict concurrency and server-first ergonomics.
- **TypeScript 5 (Strict Mode):** Type-safe interfaces across all domain entities, inference contracts, and layout components.
- **Node.js (v24 LTS):** Runtime environment with native test runner.

### Styling & Design System
- **Tailwind CSS 4:** Zero-runtime styling with accessible CSS custom properties, responsive breakpoints, high-contrast focus rings, and `prefers-reduced-motion` compliance.
- **Lucide React:** Consistent iconography with ARIA hidden attributes on decorative glyphs.

### Code Quality & Testing
- **ESLint 9 & eslint-config-next:** Linting enforcing React 19 rules and core web vitals.
- **TypeScript Compiler (`tsc`):** Strict type validation (`noUncheckedIndexedAccess`, `strictNullChecks`, `noImplicitAny`).
- **Node Test Runner (`node:test`):** Lightweight, zero-dependency unit and regression test suite.

---

## 6. Project Structure

```
accessmate/
├── .env.example                               # Safe environment variable template
├── .gitignore                                 # Git ignore rules for Next.js, Node, and environments
├── eslint.config.mjs                          # ESLint 9 configuration with Next.js core web vitals
├── next.config.ts                             # Next.js runtime and build configuration
├── package.json                               # Package manifest, dependencies, and scripts
├── tsconfig.json                              # TypeScript strict configuration
├── public/                                    # Static assets (favicons, icons)
├── tests/                                     # Foundation and domain contract test suites
│   └── foundation.test.ts                     # Test suite verifying config, constants, and utilities
└── src/
    ├── app/                                   # Next.js App Router (All 6 core routes)
    │   ├── assessment/page.tsx                # Building & Facility Assessment module preview
    │   ├── profile/page.tsx                   # Accessibility Profile criteria module preview
    │   ├── reports/page.tsx                   # Community hazard reporting module preview
    │   ├── routes/page.tsx                    # Route Assessment & Mobility Advisor preview
    │   ├── settings/page.tsx                  # Accessibility preferences & system diagnostics
    │   ├── error.tsx                          # Accessible client error boundary
    │   ├── globals.css                        # Design tokens, accessibility rings, Tailwind imports
    │   ├── layout.tsx                         # Responsive root layout wrapping AppShell
    │   ├── loading.tsx                        # Accessible loading skeleton
    │   ├── not-found.tsx                      # Accessible 404 page
    │   └── page.tsx                           # Phase 2 Dashboard Overview
    ├── components/
    │   ├── layout/                            # Structural layout components
    │   │   ├── app-header.tsx                 # Top header with breadcrumb, a11y badge, mobile toggle
    │   │   ├── app-shell.tsx                  # Desktop/mobile shell orchestrator
    │   │   ├── footer.tsx                     # Semantic footer with scope disclaimer & metadata
    │   │   ├── header.tsx                     # Top navigation bar fallback
    │   │   ├── sidebar.tsx                    # Deep navy navigation sidebar with active indicators
    │   │   └── index.ts                       # Layout barrel export
    │   └── ui/                                # Reusable, accessible UI component primitives
    │       ├── alert.tsx                      # Semantic alert callout (role="region", aria-live)
    │       ├── badge.tsx                      # Status and category indicator badges
    │       ├── breadcrumb.tsx                 # Accessible breadcrumb trail
    │       ├── button.tsx                     # Accessible button with focus rings & variants
    │       ├── card.tsx                       # Semantic card surface components
    │       ├── container.tsx                  # Responsive container with max-width scales
    │       ├── empty-state.tsx                # Accessible empty state indicator
    │       ├── form-label.tsx                 # Accessible semantic form label
    │       ├── input.tsx                      # Accessible text input with error states & icons
    │       ├── loading-state.tsx              # Skeleton loader with screen-reader status
    │       ├── section-heading.tsx            # Reusable section heading with badges & actions
    │       ├── select.tsx                     # Accessible dropdown select control
    │       ├── skip-link.tsx                  # Accessible skip-to-content anchor link
    │       ├── tooltip.tsx                    # Accessible info popover/tooltip
    │       ├── upcoming-notice.tsx            # Standardized future phase milestone notice
    │       └── index.ts                       # UI component barrel export
    ├── config/
    │   └── site.ts                            # System metadata, navigation routes, and links
    ├── constants/
    │   └── index.ts                           # Domain dimensions, evidence levels, barrier severities
    ├── features/                              # Modular feature module contracts
    │   ├── assessment/index.ts                # Built-environment audit interfaces & module barrel
    │   ├── inference/index.ts                 # Expert inference engine interfaces & module barrel
    │   ├── profiles/index.ts                  # Personalized user criteria interfaces & module barrel
    │   └── routing/index.ts                   # Route & spatial navigation interfaces & module barrel
    ├── hooks/
    │   ├── use-media-query.ts                 # Accessible matchMedia & reduced-motion subscriptions
    │   └── index.ts                           # Hooks barrel export
    ├── lib/
    │   ├── utils.ts                           # CSS class combiner (cn) & accessible date formatters
    │   └── index.ts                           # Lib barrel export
    └── types/                                 # Strict domain type definitions
        ├── assessment.ts                      # Facility attributes, entrances, vertical circulation
        ├── common.ts                          # Coordinates, address, base entity models
        ├── index.ts                           # Types barrel export
        ├── inference.ts                       # Working facts, rules, barriers, explanation traces
        ├── navigation.ts                      # Path segments, surface types, route plan contracts
        └── profile.ts                         # Mobility aids, visual, auditory, and sensory criteria
```

---

## 7. Installation & Local Development

### Prerequisites
- **Node.js:** `v20.x` or higher (recommended: `v24 LTS`)
- **npm:** `v10.x` or higher
- **Git**

### Installation & Run Steps

```bash
# 1. Clone repository
git clone https://github.com/cyhri/accessmate.git
cd accessmate

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser: http://localhost:3000
```

### Verification Pipeline

```bash
npm run test       # Run Node unit test suite
npm run typecheck  # Run TypeScript strict type verification
npm run lint       # Run ESLint validation
npm run build      # Run Next.js production build
```

---

## 8. Development Roadmap

```
Phase 1: Architecture & Technical Foundation [COMPLETED]
├── Next.js App Router, React 19, TypeScript strict mode
├── Scalable folder structure & modular feature contracts
└── CI-ready verification pipeline (Lint, Typecheck, Build, Unit Tests)

Phase 2: Professional Application Shell & Design System [COMPLETED]
├── Deep Navy & Teal design system with subtle mint backgrounds
├── Desktop sticky sidebar navigation with mobile responsive drawer
├── Complete accessible UI primitives (Card, Badge, Button, Input, Select, Tooltip, Breadcrumb)
└── 6 core application routes (Dashboard, Profile, Routes, Assessment, Reports, Settings)

Phase 3: Profiles & Assessment Modules [UPCOMING]
├── User accessibility profile builder & criteria state management
├── Structured place audit input forms with step/incline measurements
└── Evidence provenance and confidence scoring

Phase 4: Expert System Inference Engine [UPCOMING]
├── Forward-chaining rule evaluation algorithm
├── Conflict resolution & uncertainty heuristics
└── Natural-language explanation facility & trace generation

Phase 5: Routing & Spatial Decision Support [UPCOMING]
├── OpenStreetMap / OpenRouteService pedestrian routing integration
├── Micro-barrier overlay mapping (curb cuts, slope grades)
└── Turn-by-turn accessibility guidance
```

---

## 9. Important Scope & Legal Disclaimer

ACCESSMATE is an informational decision-support and planning tool. It is **not** an official municipal accessibility certification, an engineering substitute for an on-site professional access audit, or a guarantee that a specific location or route is safe to traverse. Users must always verify on-site conditions when traveling.
