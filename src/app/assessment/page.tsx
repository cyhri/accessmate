import React from "react";
import { DoorOpen, ArrowUpDown, Volume2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { UpcomingFeatureNotice } from "@/components/ui/upcoming-notice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AssessmentPage() {
  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        title="Building &amp; Facility Assessment"
        description="Structured built-environment audits, dimensional measurements, and evidence confidence classification."
        badge={
          <Badge variant="teal" size="md">
            Phase 3 Milestone
          </Badge>
        }
      />

      <UpcomingFeatureNotice
        title="Structured Built-Environment Audit Module"
        phase="Phase 3"
        description="This module captures verifiable architectural measurements across physical venues and grades evidence reliability into confidence tiers."
        plannedCapabilities={[
          "Entrance accessibility: Measures step counts, step heights, ramp gradient slope (%), and automated door openers.",
          "Doorway dimensions: Evaluates clear opening widths (cm) and threshold lip heights.",
          "Vertical circulation: Verifies operational status of elevators, cabin dimensions, braille buttons, and audible arrival announcements.",
          "Accessible sanitary facilities: Audits wheelchair turning radius, grab rail heights, and emergency alarm cords.",
          "Sensory environment: Measures typical ambient decibel levels, glare/flicker lighting, and induction hearing loops.",
          "Evidence provenance grading: Classifies every attribute into Verified Audit, Official Facility Data, Community Report, or Inferred Heuristic.",
        ]}
        architecturalContracts={[
          "PlaceAccessibilityRecord (src/types/assessment.ts)",
          "EntranceAssessment (src/types/assessment.ts)",
          "InternalVerticalCirculation (src/types/assessment.ts)",
          "RestroomAssessment (src/types/assessment.ts)",
          "SensoryEnvironmentAssessment (src/types/assessment.ts)",
          "EvidenceLevel (src/constants/index.ts)",
        ]}
      />

      {/* Building Audit Dimensions Preview */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-semibold text-slate-900">
          Core Built-Environment Audit Dimensions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <DoorOpen className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Entrance &amp; Ingress</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Clear opening widths, ramp slopes, automated sliding doors.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1 font-mono">
              <div>• hasStepFreeAccess: boolean</div>
              <div>• doorWidthCm: number (&ge;80cm standard)</div>
              <div>• rampSlopePercent: number (&le;8% ADA/BSI)</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Vertical Circulation</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Elevator dimensions, operational health, and tactile braille.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1 font-mono">
              <div>• hasElevator: boolean</div>
              <div>• elevatorOperationalStatus: &quot;operational&quot;</div>
              <div>• elevatorHasAudioFeedback: boolean</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Acoustics &amp; Lighting</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Environmental sensory demands and hearing assistive technology.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1 font-mono">
              <div>• typicalNoiseLevel: &quot;quiet&quot; | &quot;loud&quot;</div>
              <div>• hasHearingLoopSystem: boolean</div>
              <div>• hasHighContrastSignage: boolean</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
