"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  DoorOpen,
  ArrowUpDown,
  Bath,
  Eye,
  Volume2,
  HeartHandshake,
  Calendar,
  Layers,
  MapPin,
  HelpCircle,
} from "lucide-react";
import type { BuildingAssessmentRecord, EvidenceItem } from "@/types/assessment";
import { BUILDING_TYPES } from "@/constants";
import { EvidenceBadge } from "./evidence-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

export interface AssessmentDetailProps {
  readonly record: BuildingAssessmentRecord;
  readonly onEdit: () => void;
  readonly onDelete: (id: string) => void;
  readonly onBack: () => void;
}

export function AssessmentDetail({
  record,
  onEdit,
  onDelete,
  onBack,
}: AssessmentDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate evidence distribution
  const countEvidence = () => {
    let verified = 0;
    let userReported = 0;
    let unverified = 0;
    let unknown = 0;
    let notApplicable = 0;
    let total = 0;

    const inspect = (item: EvidenceItem<unknown>) => {
      total++;
      if (item.status === "verified") verified++;
      else if (item.status === "user_reported") userReported++;
      else if (item.status === "unverified") unverified++;
      else if (item.status === "unknown") unknown++;
      else if (item.status === "not_applicable") notApplicable++;
    };

    // Entrance
    inspect(record.entrance.stepFreeAccess);
    inspect(record.entrance.rampAvailability);
    inspect(record.entrance.rampSlopePercent);
    inspect(record.entrance.rampHasHandrails);
    inspect(record.entrance.stepCount);
    inspect(record.entrance.stepHeightCm);
    inspect(record.entrance.automaticDoors);
    inspect(record.entrance.doorType);
    inspect(record.entrance.doorClearWidthCm);
    inspect(record.entrance.alternativeAccessibleEntrance);
    inspect(record.entrance.entranceSignage);

    // Internal
    inspect(record.internalMovement.elevatorAvailable);
    inspect(record.internalMovement.elevatorOperationalStatus);
    inspect(record.internalMovement.elevatorDoorWidthCm);
    inspect(record.internalMovement.elevatorCabinDepthCm);
    inspect(record.internalMovement.elevatorAudioFeedback);
    inspect(record.internalMovement.elevatorBrailleButtons);
    inspect(record.internalMovement.staircaseAvailable);
    inspect(record.internalMovement.staircaseHandrails);
    inspect(record.internalMovement.corridorClearWidthCm);
    inspect(record.internalMovement.doorwayClearanceCm);
    inspect(record.internalMovement.internalRamps);
    inspect(record.internalMovement.allFloorsAccessible);

    // Restroom
    inspect(record.restroom.accessibleRestroomAvailable);
    inspect(record.restroom.restroomFloors);
    inspect(record.restroom.accessibleStallAvailable);
    inspect(record.restroom.grabBarsPresent);
    inspect(record.restroom.emergencyPullCord);
    inspect(record.restroom.doorClearWidthCm);
    inspect(record.restroom.turningRadiusCm);

    // Vision
    inspect(record.vision.tactilePaving);
    inspect(record.vision.brailleSignage);
    inspect(record.vision.highContrastSignage);
    inspect(record.vision.audioAnnouncements);
    inspect(record.vision.lightingQuality);
    inspect(record.vision.obstacleFreePaths);

    // Hearing
    inspect(record.hearing.visualAnnouncements);
    inspect(record.hearing.writtenInstructions);
    inspect(record.hearing.visualEmergencyAlerts);
    inspect(record.hearing.informationDisplays);
    inspect(record.hearing.hearingLoop);

    // Comfort
    inspect(record.comfort.seatingRestPoints);
    inspect(record.comfort.restPointIntervalMeters);
    inspect(record.comfort.quietSpaces);
    inspect(record.comfort.accessibleParking);
    inspect(record.comfort.accessibleParkingDistanceMeters);
    inspect(record.comfort.clearlyMarkedPathways);
    inspect(record.comfort.staffAssistanceAvailable);

    return { total, verified, userReported, unverified, unknown, notApplicable };
  };

  const evidenceStats = countEvidence();

  const buildingTypeLabel =
    BUILDING_TYPES.find((t) => t.value === record.general.buildingType)?.label ??
    record.general.buildingType;

  const renderFeatureRow = (
    label: string,
    item: EvidenceItem<unknown>,
    unit?: string
  ) => {
    let displayValue: string;
    if (typeof item.value === "boolean") {
      displayValue = item.value ? "Yes / Available" : "No / Absent";
    } else if (item.value === null || item.value === undefined) {
      displayValue = item.status === "not_applicable" ? "N/A" : "Not measured";
    } else {
      displayValue = `${item.value}${unit ? ` ${unit}` : ""}`;
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-zinc-100 last:border-b-0 text-xs">
        <div className="space-y-0.5">
          <div className="font-medium text-zinc-800">{label}</div>
          {item.notes && (
            <div className="text-[11px] text-zinc-500 italic">
              Note: {item.notes}
            </div>
          )}
          {item.source && (
            <div className="text-[11px] text-zinc-400">
              Source: {item.source}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-semibold text-zinc-900 bg-zinc-50 px-2 py-1 rounded border border-zinc-200">
            {displayValue}
          </span>
          <EvidenceBadge status={item.status} size="sm" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Assessments List
        </Button>

        <div className="flex items-center gap-2">
          {!showDeleteConfirm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<Trash2 className="h-4 w-4 text-rose-600" />}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Delete
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit3 className="h-4 w-4" />}
          >
            Edit Assessment
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Alert Banner */}
      {showDeleteConfirm && (
        <Alert variant="error" icon={<Trash2 className="h-5 w-5 text-rose-600" />}>
          <div className="font-semibold text-rose-900">
            Confirm Assessment Deletion
          </div>
          <div className="text-xs text-rose-800 mt-1">
            Permanently delete audit record for &ldquo;{record.general.name}&rdquo;?
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="navy"
              size="sm"
              onClick={() => onDelete(record.id)}
            >
              Yes, Permanently Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </Alert>
      )}

      {/* Facility Header Banner */}
      <Card variant="default" className="border-teal-200/80 bg-linear-to-r from-teal-50/40 via-white to-zinc-50">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {record.general.name}
                </CardTitle>
                <Badge variant="teal" size="md">
                  {buildingTypeLabel}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {record.general.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-zinc-400" />
                  {record.general.floorsCount ?? "Single"} Floor(s)
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  Audited: {formatDate(record.general.assessmentDate)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {record.general.notes && (
            <p className="text-xs text-zinc-600 bg-white/80 p-3 rounded-lg border border-zinc-200/80 mb-4 italic">
              &ldquo;{record.general.notes}&rdquo;
            </p>
          )}

          {/* Evidence Quality Breakdown Meter */}
          <div className="rounded-lg bg-white border border-zinc-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Evidence Provenance &amp; Quality Distribution ({evidenceStats.total} Features)
              </h4>
              <span className="text-xs text-zinc-400">
                Audit Record ID: {record.id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-lg font-bold text-emerald-800">{evidenceStats.verified}</div>
                <div className="text-[11px] font-medium text-emerald-700">Verified Audits</div>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                <div className="text-lg font-bold text-sky-800">{evidenceStats.userReported}</div>
                <div className="text-[11px] font-medium text-sky-700">User Reported</div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-lg font-bold text-amber-800">{evidenceStats.unverified}</div>
                <div className="text-[11px] font-medium text-amber-700">Unverified Claims</div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-300">
                <div className="text-lg font-bold text-zinc-800">{evidenceStats.unknown}</div>
                <div className="text-[11px] font-medium text-zinc-600">Unknown / Missing</div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <div className="text-lg font-bold text-zinc-600">{evidenceStats.notApplicable}</div>
                <div className="text-[11px] font-medium text-zinc-500">Not Applicable</div>
              </div>
            </div>

            {evidenceStats.unknown > 0 && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-600 mt-2">
                <HelpCircle className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Scientific Rigor Principle:</strong> {evidenceStats.unknown} environmental features are unmeasured or unverified. In ACCESSMATE, unmeasured features are explicitly classified as <em>unknown</em> rather than assumed to be accessible or inaccessible.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Entrance & Ingress */}
        <Card variant="subtle">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-teal-700">
              <DoorOpen className="h-4 w-4" />
              <CardTitle className="text-sm">Entrance &amp; Ingress</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Steps, ramps, doorway clearances, and automated ingress.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {renderFeatureRow("Step-Free Access", record.entrance.stepFreeAccess)}
            {renderFeatureRow("Ramp Available", record.entrance.rampAvailability)}
            {renderFeatureRow("Ramp Slope", record.entrance.rampSlopePercent, "%")}
            {renderFeatureRow("Ramp Handrails", record.entrance.rampHasHandrails)}
            {renderFeatureRow("Step Count", record.entrance.stepCount)}
            {renderFeatureRow("Step Height", record.entrance.stepHeightCm, "cm")}
            {renderFeatureRow("Automated Doors", record.entrance.automaticDoors)}
            {renderFeatureRow("Door Mechanism", record.entrance.doorType)}
            {renderFeatureRow("Door Clear Width", record.entrance.doorClearWidthCm, "cm")}
            {renderFeatureRow("Alternative Accessible Entry", record.entrance.alternativeAccessibleEntrance)}
            {renderFeatureRow("Entrance Wayfinding Signage", record.entrance.entranceSignage)}
          </CardContent>
        </Card>

        {/* Vertical Circulation */}
        <Card variant="subtle">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-teal-700">
              <ArrowUpDown className="h-4 w-4" />
              <CardTitle className="text-sm">Internal Movement &amp; Lifts</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Elevator health, cabin clearances, braille buttons, and corridor widths.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {renderFeatureRow("Elevator Available", record.internalMovement.elevatorAvailable)}
            {renderFeatureRow("Elevator Operational Status", record.internalMovement.elevatorOperationalStatus)}
            {renderFeatureRow("Elevator Door Width", record.internalMovement.elevatorDoorWidthCm, "cm")}
            {renderFeatureRow("Elevator Cabin Depth", record.internalMovement.elevatorCabinDepthCm, "cm")}
            {renderFeatureRow("Elevator Voice Feedback", record.internalMovement.elevatorAudioFeedback)}
            {renderFeatureRow("Elevator Braille Controls", record.internalMovement.elevatorBrailleButtons)}
            {renderFeatureRow("Staircase Available", record.internalMovement.staircaseAvailable)}
            {renderFeatureRow("Staircase Handrails", record.internalMovement.staircaseHandrails)}
            {renderFeatureRow("Corridor Clear Width", record.internalMovement.corridorClearWidthCm, "cm")}
            {renderFeatureRow("All Floors Reachable", record.internalMovement.allFloorsAccessible)}
          </CardContent>
        </Card>

        {/* Accessible Restroom Facilities */}
        <Card variant="subtle">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-teal-700">
              <Bath className="h-4 w-4" />
              <CardTitle className="text-sm">Accessible Sanitary Facilities</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Wheelchair stalls, grab bars, turning radius, and alarms.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {renderFeatureRow("Accessible Restroom Present", record.restroom.accessibleRestroomAvailable)}
            {renderFeatureRow("Restroom Floor Location", record.restroom.restroomFloors)}
            {renderFeatureRow("Accessible Stall Present", record.restroom.accessibleStallAvailable)}
            {renderFeatureRow("Sturdy Grab Bars Installed", record.restroom.grabBarsPresent)}
            {renderFeatureRow("Emergency Alarm Pull Cord", record.restroom.emergencyPullCord)}
            {renderFeatureRow("Restroom Door Width", record.restroom.doorClearWidthCm, "cm")}
            {renderFeatureRow("Wheelchair Turning Radius", record.restroom.turningRadiusCm, "cm")}
          </CardContent>
        </Card>

        {/* Vision & Spatial Wayfinding */}
        <Card variant="subtle">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-teal-700">
              <Eye className="h-4 w-4" />
              <CardTitle className="text-sm">Vision &amp; Spatial Wayfinding</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Tactile ground paving, braille signs, contrast, and acoustics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {renderFeatureRow("Tactile Ground Paving", record.vision.tactilePaving)}
            {renderFeatureRow("Braille Signage", record.vision.brailleSignage)}
            {renderFeatureRow("High-Contrast Visual Signs", record.vision.highContrastSignage)}
            {renderFeatureRow("Spoken Audio Announcements", record.vision.audioAnnouncements)}
            {renderFeatureRow("Lighting & Illumination Quality", record.vision.lightingQuality)}
            {renderFeatureRow("Obstacle-Free Circulation Paths", record.vision.obstacleFreePaths)}
          </CardContent>
        </Card>

        {/* Hearing & Communication */}
        <Card variant="subtle">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-teal-700">
              <Volume2 className="h-4 w-4" />
              <CardTitle className="text-sm">Hearing &amp; Assistive Systems</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Visual emergency beacons, induction loops, and captioning.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {renderFeatureRow("Visual Arrival Displays", record.hearing.visualAnnouncements)}
            {renderFeatureRow("Visual Emergency Strobe Alarms", record.hearing.visualEmergencyAlerts)}
            {renderFeatureRow("Written Guides Available", record.hearing.writtenInstructions)}
            {renderFeatureRow("Hearing Induction Loop (T-Coil)", record.hearing.hearingLoop)}
          </CardContent>
        </Card>

        {/* Rest, Comfort & Amenities */}
        <Card variant="subtle">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-teal-700">
              <HeartHandshake className="h-4 w-4" />
              <CardTitle className="text-sm">Rest, Comfort &amp; Parking</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Seating frequency, low-sensory quiet rooms, and parking.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {renderFeatureRow("Seating / Rest Points", record.comfort.seatingRestPoints)}
            {renderFeatureRow("Rest Point Interval", record.comfort.restPointIntervalMeters, "m")}
            {renderFeatureRow("Quiet Decompression Spaces", record.comfort.quietSpaces)}
            {renderFeatureRow("Accessible Parking Bays", record.comfort.accessibleParking)}
            {renderFeatureRow("Distance to Parking", record.comfort.accessibleParkingDistanceMeters, "m")}
            {renderFeatureRow("Clearly Marked Routes", record.comfort.clearlyMarkedPathways)}
            {renderFeatureRow("Staff Assistance On-Site", record.comfort.staffAssistanceAvailable)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
