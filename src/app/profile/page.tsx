import React from "react";
import { Accessibility, Sliders, Shield } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { UpcomingFeatureNotice } from "@/components/ui/upcoming-notice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        title="Accessibility Profile"
        description="Configure individualized accessibility criteria, mobility aid specifications, and environmental tolerance limits."
        badge={
          <Badge variant="teal" size="md">
            Phase 3 Milestone
          </Badge>
        }
      />

      <UpcomingFeatureNotice
        title="Personalized Accessibility Profile Engine"
        phase="Phase 3"
        description="This module will allow travelers to define their specific functional requirements, eliminating reliance on generic, one-size-fits-all accessibility ratings."
        plannedCapabilities={[
          "Select mobility aid: Manual wheelchair, power wheelchair, mobility scooter, walker, crutches, cane, or guide dog.",
          "Specify threshold constraints: Maximum step height tolerance (cm) and maximum ramp slope (%).",
          "Specify doorway clearances: Minimum doorway clear width (cm) required for device passage.",
          "Visual & auditory settings: Need for tactile ground paving, high-contrast signage, braille, or hearing loops.",
          "Sensory sensitivities: Tolerance limits for loud ambient noise, crowd density, and flickering lighting.",
          "Walking range constraints: Maximum continuous walking distance (meters) before rest seating is required.",
        ]}
        architecturalContracts={[
          "UserAccessibilityProfile (src/types/profile.ts)",
          "MobilityRequirements (src/types/profile.ts)",
          "VisionRequirements (src/types/profile.ts)",
          "HearingRequirements (src/types/profile.ts)",
          "SensoryCognitiveRequirements (src/types/profile.ts)",
        ]}
      />

      {/* Profile Schema Specification Preview */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-semibold text-slate-900">
          Planned Profile Schema Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Sliders className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Mobility Constraints</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Step-free requirements, doorway width thresholds, and ramp slope tolerances.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1 font-mono">
              <div>• requiresStepFreeAccess: boolean</div>
              <div>• minDoorwayWidthCm: number (e.g. 80cm)</div>
              <div>• maxRampSlopePercent: number (e.g. 8%)</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Accessibility className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Sensory &amp; Visual Needs</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Acoustic limits, contrast illumination, and tactile paving guidance.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1 font-mono">
              <div>• requiresTactileGroundPaving: boolean</div>
              <div>• requiresHighContrastSignage: boolean</div>
              <div>• sensitiveToLoudNoise: boolean</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Shield className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Stamina &amp; Rest Demands</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Continuous walking endurance limits and rest seating interval demands.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1 font-mono">
              <div>• maxWalkingDistanceMeters: number</div>
              <div>• requiresRestStopsEveryMeters: number</div>
              <div>• requiresElevatorForLevels: boolean</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
