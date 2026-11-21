# ACCESSMATE — Personalized Accessibility & Mobility Decision-Support System

> **Phase 1 Technical Foundation Baseline**  
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

## 4. Core Planned Features

The full ACCESSMATE platform is being delivered across structured phases:

| Feature Dimension | Description | Implementation Phase |
| :--- | :--- | :--- |
| **Personalized Accessibility Profiles** | Structured profiles capturing mobility aids, maximum step height, door clearance, lighting needs, hearing loops, and walking stamina limits. | Phase 3 (Planned) |
| **Place & Facility Audits** | Multi-attribute assessment schema covering entrances, vertical circulation, restrooms, acoustics, lighting, and evidence tier scoring. | Phase 3 (Planned) |
| **Forward-Chaining Rule Engine** | Working-memory evaluation applying universal design heuristics, barrier severity classification (Critical, High, Medium, Low), and conflict resolution. | Phase 4 (Planned) |
| **Explainability Facility** | Natural-language explanation traces detailing triggered rules, matched criteria, unmet needs, and confidence levels. | Phase 4 (Planned) |
| **Route & Spatial Navigation** | Micro-routing avoiding steep inclines, curb drops, cobblestones, and poorly lit corridors using OpenStreetMap and OpenRouteService data. | Phase 5 (Planned) |
| **Community Reporting & Verification** | Crowd-sourced validation of temporary hazards (e.g., broken lifts, construction scaffolding) with evidence decay mechanics. | Future Phase (Planned) |

> **Scope Note:** Features listed as "Planned" are architectural specifications for upcoming phases. Phase 1 establishes the verified codebase foundation, type contracts, folder hierarchy, design tokens, and CI quality gates.

---

## 5. Technology Stack

### Core Framework & Runtime
- **Next.js 16 (App Router):** Server-rendered application shell, Partial Prerendering, and static optimization.
- **React 19:** Component model with strict concurrency and server-first ergonomics.
- **TypeScript 5 (Strict Mode):** Type-safe interfaces across all domain entities, inference contracts, and layout components.
- **Node.js (v24 LTS):** Runtime environment with native test runner.

### Styling & Design System
- **Tailwind CSS 4:** Zero-runtime styling with accessible CSS custom properties, responsive breakpoints, high-contrast focus rings, and `prefers-reduced-motion` compliance.

### Code Quality & Testing
- **ESLint 9 & eslint-config-next:** Linting enforcing React 19 rules and core web vitals.
- **TypeScript Compiler (`tsc`):** Strict type validation (`noUncheckedIndexedAccess`, `strictNullChecks`, `noImplicitAny`).
- **Node Test Runner (`node:test`):** Lightweight, zero-dependency unit and regression test suite.

---

## 6. Architecture Overview

ACCESSMATE follows a modular layered architecture to guarantee that domain logic, inference rules, and presentation concerns remain completely decoupled:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│    Next.js App Router (src/app) + UI Components (src/ui)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│       Feature Modules       │ │       Layout & Shell        │
│    (Profiles, Assessment,   │ │    (Header, Footer, Skip,   │
│     Inference, Routing)     │ │     Navigation, Alerts)     │
└──────────────┬──────────────┘ └─────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│             Domain & Knowledge-Base Contracts               │
│     src/types (Profile, Assessment, Inference, Navigation)  │
│     src/constants (Dimensions, Evidence Tiers, Severities)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Project Structure

```
accessmate/
├── .env.example              # Safe environment variable template
├── .gitignore                # Git ignore rules for Next.js, Node, and environments
├── eslint.config.mjs         # ESLint 9 configuration with Next.js core web vitals
├── next.config.ts            # Next.js runtime and build configuration
├── package.json              # Package manifest, dependencies, and scripts
├── tsconfig.json             # TypeScript strict configuration
├── public/                   # Static assets (favicons, icons)
├── tests/                    # Foundation and domain contract test suites
│   └── foundation.test.ts    # Test suite verifying config, constants, and utilities
└── src/
    ├── app/                  # Next.js App Router
    │   ├── error.tsx         # Accessible client error boundary
    │   ├── globals.css       # Design tokens, accessibility rings, Tailwind imports
    │   ├── layout.tsx        # Responsive root layout with SkipLink, Header, Footer
    │   ├── loading.tsx       # Accessible loading skeleton
    │   ├── not-found.tsx     # Accessible 404 page
    │   └── page.tsx          # Phase 1 Overview & System Architecture Dashboard
    ├── components/
    │   ├── layout/           # Structural layout components
    │   │   ├── footer.tsx    # Semantic footer with scope disclaimer & metadata
    │   │   ├── header.tsx    # Accessible navigation bar with phase status badge
    │   │   └── index.ts      # Layout barrel export
    │   └── ui/               # Reusable, accessible UI component primitives
    │       ├── alert.tsx     # Semantic alert callout (role="region", aria-live)
    │       ├── badge.tsx     # Status and category indicator badges
    │       ├── button.tsx    # Accessible button with focus rings & variants
    │       ├── card.tsx      # Semantic card surface components
    │       ├── container.tsx # Responsive container with max-width scales
    │       ├── skip-link.tsx # Accessible skip-to-content anchor link
    │       └── index.ts      # UI component barrel export
    ├── config/
    │   └── site.ts           # System metadata, navigation routes, and links
    ├── constants/
    │   └── index.ts          # Domain dimensions, evidence levels, barrier severities
    ├── features/             # Modular feature module contracts
    │   ├── assessment/       # Built-environment audit interfaces & module barrel
    │   ├── inference/        # Expert inference engine interfaces & module barrel
    │   ├── profiles/         # Personalized user criteria interfaces & module barrel
    │   └── routing/          # Route & spatial navigation interfaces & module barrel
    ├── hooks/
    │   ├── use-media-query.ts# Accessible matchMedia & reduced-motion subscriptions
    │   └── index.ts          # Hooks barrel export
    ├── lib/
    │   ├── utils.ts          # CSS class combiner (cn) & accessible date formatters
    │   └── index.ts          # Lib barrel export
    └── types/                # Strict domain type definitions
        ├── assessment.ts     # Facility attributes, entrances, vertical circulation
        ├── common.ts         # Coordinates, address, base entity models
        ├── index.ts          # Types barrel export
        ├── inference.ts      # Working facts, rules, barriers, explanation traces
        ├── navigation.ts     # Path segments, surface types, route plan contracts
        └── profile.ts        # Mobility aids, visual, auditory, and sensory criteria
```

---

## 8. Installation & Setup

### Prerequisites
- **Node.js:** `v20.x` or higher (recommended: `v24 LTS`)
- **npm:** `v10.x` or higher
- **Git**

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/cyhri/accessmate.git
   cd accessmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

---

## 9. Local Development & Verification

### Development Server
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification Commands

Execute the automated quality pipeline:

```bash
# 1. Run unit test suite
npm run test

# 2. Run TypeScript strict type-checking
npm run typecheck

# 3. Run ESLint code quality checks
npm run lint

# 4. Run Next.js production build
npm run build
```

---

## 10. Development Roadmap

```
Phase 1: Architecture & Technical Foundation [COMPLETED]
├── Next.js App Router, React 19, TypeScript strict mode
├── Scalable folder structure & modular feature contracts
├── Reusable accessible UI primitives (Card, Badge, Button, Alert, SkipLink)
└── CI-ready verification pipeline (Lint, Typecheck, Build, Unit Tests)

Phase 2: Application Shell & Design System [UPCOMING]
├── High-contrast accessibility themes and font scaling
├── Interactive dashboard navigation & state providers
└── Screen-reader verified form components

Phase 3: Profiles & Assessment Modules [UPCOMING]
├── User accessibility profile builder & local storage persistence
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

## 11. Important Scope & Legal Disclaimer

ACCESSMATE is an informational decision-support and planning tool. It is **not** an official municipal accessibility certification, an engineering substitute for an on-site professional access audit, or a guarantee that a specific location or route is safe to traverse. Users must always verify on-site conditions when traveling.
