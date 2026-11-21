import React from "react";
import { Compass, Footprints, AlertTriangle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { UpcomingFeatureNotice } from "@/components/ui/upcoming-notice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RoutesPage() {
  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        title="Route Assessment &amp; Mobility Advisor"
        description="Pedestrian pathway evaluation, surface roughness analysis, curb ramp verification, and slope incline analysis."
        badge={
          <Badge variant="teal" size="md">
            Phase 5 Milestone
          </Badge>
        }
      />

      <UpcomingFeatureNotice
        title="Spatial Route &amp; Pedestrian Navigation Engine"
        phase="Phase 5"
        description="This module will combine OpenStreetMap infrastructure geometry, OpenRouteService pedestrian routing, and micro-accessibility attributes to calculate safe, barrier-free walking routes."
        plannedCapabilities={[
          "Micro-barrier avoidance: Identifies steps, flights of stairs, construction disruptions, and curb drops.",
          "Surface roughness detection: Classifies smooth asphalt, uneven flagstones, gravel, and cobblestone hazards.",
          "Slope incline analysis: Calculates segment gradients to ensure wheelchair users do not encounter impassable inclines (>8%).",
          "Tactile navigation overlays: Detects pedestrian crossings with acoustic pushbuttons and tactile paving.",
          "Lighting & security ratings: Evaluates nighttime street illumination along candidate routes.",
          "Turn-by-turn guidance: Step-by-step navigation instructions customized to user walking stamina and mobility aid.",
        ]}
        architecturalContracts={[
          "RoutePlan (src/types/navigation.ts)",
          "PathSegment (src/types/navigation.ts)",
          "SurfaceType (src/types/navigation.ts)",
          "GeoCoordinates (src/types/common.ts)",
        ]}
      />

      {/* Routing Analysis Dimensions Preview */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-semibold text-slate-900">
          Planned Routing Analysis Dimensions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Footprints className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Surface Materials</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Classification of ground surfaces impacting wheeled mobility.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <div>• Smooth Pavement / Asphalt: Optimal</div>
              <div>• Cobblestone / Pavers: High Vibration Barrier</div>
              <div>• Loose Gravel / Dirt: Severe Wheelchair Hazard</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Compass className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Incline &amp; Elevation</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Slope percentage calculation across route segments.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <div>• Grade &le; 5%: Gentle slope (Fully Accessible)</div>
              <div>• Grade 6% - 8%: Moderate (Requires Handrails)</div>
              <div>• Grade &gt; 8%: Steep Barrier for Manual Chairs</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Intersection Safety</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Crosswalk features for vision and physical mobility.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <div>• Dropped Curbs / Flush Transition</div>
              <div>• Audible Signal &amp; Vibrotactile Pushbuttons</div>
              <div>• Tactile Ground Surface Indicators (TGSI)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
