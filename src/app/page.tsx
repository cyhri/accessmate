import React from "react";
import { siteConfig } from "@/config/site";
import { PROJECT_PHASES, ACCESSIBILITY_DIMENSIONS } from "@/constants";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function HomePage() {
  return (
    <div className="py-10 space-y-12">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="border-b border-slate-200 dark:border-slate-800 pb-12">
        <Container size="lg">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="info">Phase 1 Foundation</Badge>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rule-Based Decision-Support Architecture
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
            >
              {siteConfig.name}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-blue-600 dark:text-blue-400">
              {siteConfig.tagLine}
            </p>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              ACCESSMATE replaces generic, binary &ldquo;accessible / not accessible&rdquo; labels with
              personalized, multi-dimensional compatibility reasoning. By evaluating an individual&rsquo;s specific
              mobility, visual, auditory, and sensory criteria against structured facility audits, the system
              identifies critical barriers and provides an explainable decision trace.
            </p>

            <Alert variant="info" className="mt-6">
              <AlertTitle>Phase 1 Technical Foundation Initialized</AlertTitle>
              <AlertDescription>
                This application shell establishes the modular architecture, strict type contracts, design tokens,
                and engineering standards. Interactive profile forms, rule-based inference, and spatial route mapping
                will be unlocked across subsequent phases as outlined in the development roadmap below.
              </AlertDescription>
            </Alert>
          </div>
        </Container>
      </section>

      {/* Logical Processing Flow / Decision-Support Model */}
      <section aria-labelledby="model-heading">
        <Container size="lg">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2
                id="model-heading"
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Decision-Support Reasoning Model
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                How ACCESSMATE evaluates individual environmental compatibility through knowledge-based reasoning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1: User Profile */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                      Step 1
                    </span>
                    <Badge variant="neutral">Phase 3</Badge>
                  </div>
                  <CardTitle>Personalized Criteria</CardTitle>
                  <CardDescription>
                    User-configured profile specifying mobility aids, maximum step height, door clearance, lighting, and sensory tolerances.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                    <li>Mobility &amp; assistive devices</li>
                    <li>Visual &amp; tactile guidance</li>
                    <li>Auditory &amp; alarm preferences</li>
                    <li>Stamina &amp; max walking range</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pillar 2: Place Assessment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                      Step 2
                    </span>
                    <Badge variant="neutral">Phase 3</Badge>
                  </div>
                  <CardTitle>Structured Audit Facts</CardTitle>
                  <CardDescription>
                    Physical facility attributes, doorway widths, ramp slope grades, elevator statuses, and graded evidence quality tiers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                    <li>Entrances &amp; doorway clearances</li>
                    <li>Ramps, lifts &amp; vertical circulation</li>
                    <li>Sanitary &amp; restroom facilities</li>
                    <li>Evidence confidence rating</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pillar 3: Expert Inference */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                      Step 3
                    </span>
                    <Badge variant="neutral">Phase 4</Badge>
                  </div>
                  <CardTitle>Forward-Chaining Engine</CardTitle>
                  <CardDescription>
                    Evaluates rule sets against working memory facts, identifies conflicts, checks missing data, and fires domain rules.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                    <li>Universal design heuristics</li>
                    <li>Barrier severity classification</li>
                    <li>Uncertainty &amp; missing data detection</li>
                    <li>Conflict resolution rules</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pillar 4: Explainable Output */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                      Step 4
                    </span>
                    <Badge variant="neutral">Phase 4</Badge>
                  </div>
                  <CardTitle>Decision Support &amp; Trace</CardTitle>
                  <CardDescription>
                    Profile-specific compatibility outcome, highlighted blockers, practical recommendations, and complete explanation trace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                    <li>Compatibility status score</li>
                    <li>Severity-ranked barriers</li>
                    <li>Rule firing explanation trace</li>
                    <li>Actionable travel advice</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Evaluated Dimensions */}
      <section aria-labelledby="dimensions-heading" className="bg-slate-100/70 dark:bg-slate-900/50 py-10">
        <Container size="lg">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2
                id="dimensions-heading"
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Evaluated Accessibility Dimensions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Core facets governed by ACCESSMATE&rsquo;s modular type contracts and domain knowledge base.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ACCESSIBILITY_DIMENSIONS.map((dimension) => (
                <div
                  key={dimension}
                  className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <h3 className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
                    {dimension.replace("_", " ")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Strict contracts defined in <code className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">@/types</code>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Engineering Roadmap Section */}
      <section id="architecture" aria-labelledby="roadmap-heading">
        <Container size="lg">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2
                id="roadmap-heading"
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Engineering &amp; Implementation Roadmap
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Structured phased delivery ensuring clean separation of concerns and rigorous quality gates.
              </p>
            </div>

            <div className="space-y-4">
              {PROJECT_PHASES.map((phaseItem) => (
                <Card
                  key={phaseItem.phase}
                  className={phaseItem.status === "active" ? "border-blue-500/80 ring-1 ring-blue-500/50" : undefined}
                >
                  <CardHeader className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {phaseItem.phase}
                        </span>
                        <div>
                          <CardTitle className="text-base">{phaseItem.name}</CardTitle>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {phaseItem.description}
                          </p>
                        </div>
                      </div>

                      <div>
                        {phaseItem.status === "active" ? (
                          <Badge variant="success">Completed in Phase 1</Badge>
                        ) : (
                          <Badge variant="neutral">Planned Next</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
