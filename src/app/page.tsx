import React from "react";
import Link from "next/link";
import {
  Navigation,
  Building2,
  UserCheck,
  Cpu,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Layers,
  Scale,
  Compass,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-8">
      {/* 1. Welcome Section */}
      <section aria-labelledby="welcome-heading" className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-teal-50/60 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" size="sm" dot>
              Phase 2 Active
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Personalized Decision-Support
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 id="welcome-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              {siteConfig.name}
            </h2>
            <p className="text-lg sm:text-xl font-semibold text-teal-700">
              &ldquo;Accessibility information, personalised to your needs.&rdquo;
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            ACCESSMATE evaluates environmental compatibility between your unique accessibility criteria and
            physical built environments or transit corridors. Moving beyond generic binary labels, the system
            applies a structured forward-chaining expert system to detect barriers, communicate data uncertainty,
            and provide transparent, explainable recommendations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/routes">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Assess a Route
              </Button>
            </Link>
            <Link href="/assessment">
              <Button variant="outline" size="md">
                Check a Building
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" size="md">
                Manage Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Action Section */}
      <section aria-labelledby="actions-heading" className="space-y-4">
        <SectionHeading
          title="Core Decision Actions"
          description="Primary workflows to evaluate routes, inspect physical buildings, and calibrate criteria."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action 1: Assess a Route */}
          <Card className="hover:border-teal-300 transition-all group flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge variant="neutral" size="sm">
                  Phase 5 Upcoming
                </Badge>
              </div>
              <CardTitle>Assess a Route</CardTitle>
              <CardDescription>
                Analyze pedestrian pathways, slope inclines, curb ramps, and surface conditions between two coordinates.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Link href="/routes" className="block w-full">
                <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  <span>Explore Route Advisor</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Action 2: Check a Building */}
          <Card className="hover:border-teal-300 transition-all group flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge variant="neutral" size="sm">
                  Phase 3 Upcoming
                </Badge>
              </div>
              <CardTitle>Check a Building</CardTitle>
              <CardDescription>
                Evaluate facility entrances, door clearances, elevator status, restroom accessibility, and acoustic levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Link href="/assessment" className="block w-full">
                <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  <span>Explore Building Audits</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Action 3: Manage Accessibility Profile */}
          <Card className="hover:border-teal-300 transition-all group flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <UserCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge variant="neutral" size="sm">
                  Phase 3 Upcoming
                </Badge>
              </div>
              <CardTitle>Manage Accessibility Profile</CardTitle>
              <CardDescription>
                Configure assistive equipment, max step height tolerances, visual contrast requirements, and stamina thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Link href="/profile" className="block w-full">
                <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  <span>View Profile Schema</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. System Overview & Module Implementation Status */}
      <section aria-labelledby="modules-heading" className="space-y-4">
        <SectionHeading
          title="Platform Modules &amp; Implementation Status"
          description="Transparent tracking of core architecture modules across planned engineering phases."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <UserCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <Badge variant="neutral" size="sm">
                Phase 3 Upcoming
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Accessibility Profiles</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Captures personalized requirements across mobility, vision, hearing, sensory, and stamina.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
              Contract: @/types/profile.ts
            </div>
          </div>

          {/* Module 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <Badge variant="neutral" size="sm">
                Phase 3 Upcoming
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Building Assessments</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Structured physical facility audits with dimensional clearances and evidence confidence grading.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
              Contract: @/types/assessment.ts
            </div>
          </div>

          {/* Module 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Cpu className="h-4 w-4" aria-hidden="true" />
              </span>
              <Badge variant="neutral" size="sm">
                Phase 4 Upcoming
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Expert Inference Engine</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Forward-chaining rule evaluation, working memory fact matching, and barrier severity grading.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
              Contract: @/types/inference.ts
            </div>
          </div>

          {/* Module 4 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <Badge variant="neutral" size="sm">
                Phase 5 Upcoming
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Accessibility Mapping</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pedestrian micro-routing avoiding stairs, steep slopes, and surface barriers via spatial APIs.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-100">
              Contract: @/types/navigation.ts
            </div>
          </div>
        </div>
      </section>

      {/* 4. How ACCESSMATE Works */}
      <section aria-labelledby="how-heading" className="space-y-4">
        <SectionHeading
          title="How ACCESSMATE Works"
          description="The 4-stage personalized compatibility reasoning architecture."
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                1
              </span>
              <h4 className="text-sm font-semibold text-slate-900">User Profile Criteria</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Individual needs are structured into parameters: mobility aid dimensions, step tolerance, visual contrast, sensory thresholds, and walking stamina limits.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                2
              </span>
              <h4 className="text-sm font-semibold text-slate-900">Built-Environment Facts</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Physical attributes are captured from structured audits: doorway clear widths, ramp slope percentages, elevator operational states, and restroom turning radiuses.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                3
              </span>
              <h4 className="text-sm font-semibold text-slate-900">Rule Knowledge Base</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Universal design standards and heuristic accessibility rules fire against working memory to detect blockers, calculate confidence, and resolve rule conflicts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                4
              </span>
              <h4 className="text-sm font-semibold text-slate-900">Explainable Decision Trace</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produces a profile-specific compatibility score, categorizes barriers by severity (Critical, High, Medium, Low), and provides full transparency on which rules triggered.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Why Personalized Accessibility Matters */}
      <section aria-labelledby="why-heading" className="space-y-4">
        <SectionHeading
          title="Why Personalised Accessibility Matters"
          description="Accessibility is multi-dimensional. A single generic label fails because different individuals face distinct barriers."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card variant="subtle">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-800 mb-2">
                <Compass className="h-4 w-4" aria-hidden="true" />
              </div>
              <CardTitle className="text-base">Mobility &amp; Physical Access</CardTitle>
              <CardDescription>
                A step-free entrance with a heavy manual door or a narrow 70 cm doorway is still impassable for a power wheelchair user. Door clearance and slope percentage dictate feasibility.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="subtle">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-800 mb-2">
                <Layers className="h-4 w-4" aria-hidden="true" />
              </div>
              <CardTitle className="text-base">Vision &amp; Tactile Wayfinding</CardTitle>
              <CardDescription>
                Ramps without tactile ground surface indicators (TGSI) or signs lacking high visual contrast present safety hazards for individuals with low vision, regardless of wheelchair access.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="subtle">
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-800 mb-2">
                <Scale className="h-4 w-4" aria-hidden="true" />
              </div>
              <CardTitle className="text-base">Sensory &amp; Stamina Demands</CardTitle>
              <CardDescription>
                A facility with intense echo acoustics, flickering fluorescent lighting, or lacking rest seating every 50 meters causes exhaustion for users with chronic pain or neurodivergence.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 6. Evidence Quality & Uncertainty */}
      <section aria-labelledby="evidence-heading" className="space-y-4">
        <SectionHeading
          title="Evidence Quality &amp; Uncertainty Tiers"
          description="How ACCESSMATE communicates data provenance so travelers know how much to rely on the assessment."
        />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data credibility directly affects travel safety. ACCESSMATE explicitly labels the evidence level
            associated with every evaluated building attribute:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <Badge variant="success" size="sm">Verified Audit</Badge>
              <p className="text-xs text-emerald-900 leading-normal">
                On-site measurement verified with physical audit tools. Highest confidence.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
              <Badge variant="teal" size="sm">Official Data</Badge>
              <p className="text-xs text-blue-900 leading-normal">
                Submitted by facility management or municipal registry.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <Badge variant="warning" size="sm">Community Reported</Badge>
              <p className="text-xs text-amber-900 leading-normal">
                User crowd-sourced report. Subject to peer verification and temporal decay.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Badge variant="neutral" size="sm">Inferred Heuristic</Badge>
              <p className="text-xs text-slate-700 leading-normal">
                Derived from building age, satellite topology, or typical architectural archetypes.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/60 p-3 sm:col-span-2">
              <Badge variant="error" size="sm">Unknown / Missing</Badge>
              <p className="text-xs text-rose-900 leading-normal">
                No reliable data available. The system explicitly flags uncertainty rather than guessing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Safety & Real-World Verification Notice */}
      <section aria-label="Important Safety Notice">
        <Alert variant="warning" icon={<ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}>
          <AlertTitle>Important Real-World Verification Notice</AlertTitle>
          <AlertDescription>
            ACCESSMATE is an informational decision-support and planning aid. It is not an official legal
            accessibility certification, an engineering substitute for an on-site access audit, or an unconditional
            guarantee that a route or building is safe to traverse. Built environments change due to temporary
            construction, elevator maintenance outages, or weather conditions. Always exercise independent judgment
            and verify on-site conditions when traveling.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
