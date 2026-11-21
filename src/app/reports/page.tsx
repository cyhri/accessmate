import React from "react";
import { Clock, ThumbsUp, AlertTriangle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { UpcomingFeatureNotice } from "@/components/ui/upcoming-notice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        title="Community Reports &amp; Real-Time Alerts"
        description="Crowd-sourced temporary obstacle reports, out-of-service elevator alerts, and peer verification."
        badge={
          <Badge variant="warning" size="md">
            Future Phase Milestone
          </Badge>
        }
      />

      <UpcomingFeatureNotice
        title="Community Barrier &amp; Hazard Verification System"
        phase="Future Phase"
        description="This module empowers the community to report temporary, real-world obstacles (such as broken elevators, sidewalk construction, or icy ramps) that standard municipal registries miss."
        plannedCapabilities={[
          "Out-of-service elevator alerts: Immediate reporting of broken lifts in transit stations and public buildings.",
          "Temporary walkway construction: Flags scaffolding, blocked sidewalk paths, and missing curb ramps.",
          "Evidence confidence decay: Temporary hazard reports decay over time unless re-verified by fellow travelers.",
          "Peer upvoting and verification: High-trust ratings awarded to reports confirmed by multiple independent community members.",
          "Inference engine feedback: Real-time hazard reports immediately fire avoidance rules in the route advisor.",
        ]}
        architecturalContracts={[
          "EVIDENCE_LEVELS.COMMUNITY_REPORTED (src/constants/index.ts)",
          "Barrier (src/types/inference.ts)",
          "WorkingFact (src/types/inference.ts)",
        ]}
      />

      {/* Community Verification Concepts Preview */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-semibold text-slate-900">
          Community Verification &amp; Trust Model
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Temporary Obstacles</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Captures real-time changes that permanent audits cannot reflect.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <div>• Broken elevator / lift outages</div>
              <div>• Sidewalk repaving / scaffolding</div>
              <div>• Blocked accessible toilet doors</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Confidence Decay</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Temporal decay algorithm prevents outdated reports from lingering.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <div>• 0 - 24 hours: Active High Alert</div>
              <div>• 24 - 72 hours: Decaying / Verification Needed</div>
              <div>• &gt; 72 hours: Auto-archived without confirmation</div>
            </CardContent>
          </Card>

          <Card variant="subtle">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-teal-700 mb-1">
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                <CardTitle className="text-sm">Trust Scoring</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Multi-witness consensus elevates report weight in inference calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <div>• Multiple user consensus</div>
              <div>• Photo evidence upload verification</div>
              <div>• Verified local auditor endorsements</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
