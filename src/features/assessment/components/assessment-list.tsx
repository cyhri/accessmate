"use client";

import React, { useState } from "react";
import {
  Plus,
  RotateCcw,
  Search,
  Building2,
  MapPin,
  ChevronRight,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import type { BuildingAssessmentRecord, EvidenceItem } from "@/types/assessment";
import { BUILDING_TYPES } from "@/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export interface AssessmentListProps {
  readonly assessments: readonly BuildingAssessmentRecord[];
  readonly onSelect: (id: string) => void;
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onCreateNew: () => void;
  readonly onResetSampleData: () => void;
}

export function AssessmentList({
  assessments,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew,
  onResetSampleData,
}: AssessmentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = assessments.filter((record) => {
    const matchesSearch =
      record.general.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.general.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.general.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || record.general.buildingType === selectedType;

    return matchesSearch && matchesType;
  });

  const getEvidenceSummary = (record: BuildingAssessmentRecord) => {
    let verified = 0;
    let userReported = 0;
    let unknown = 0;

    const inspect = (item: EvidenceItem<unknown>) => {
      if (item.status === "verified") verified++;
      else if (item.status === "user_reported") userReported++;
      else if (item.status === "unknown") unknown++;
    };

    inspect(record.entrance.stepFreeAccess);
    inspect(record.entrance.rampAvailability);
    inspect(record.entrance.automaticDoors);
    inspect(record.internalMovement.elevatorAvailable);
    inspect(record.internalMovement.allFloorsAccessible);
    inspect(record.restroom.accessibleRestroomAvailable);
    inspect(record.vision.tactilePaving);
    inspect(record.vision.audioAnnouncements);
    inspect(record.hearing.hearingLoop);
    inspect(record.comfort.quietSpaces);

    return { verified, userReported, unknown };
  };

  const getBuildingTypeLabel = (type: string) => {
    return BUILDING_TYPES.find((t) => t.value === type)?.label ?? type;
  };

  return (
    <div className="space-y-6">
      {/* List Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Built-Environment Audits ({assessments.length})
          </h2>
          <p className="text-xs text-slate-500">
            Structured place accessibility inventories with verifiable architectural metrics and evidence confidence tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetSampleData}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset Seed Data
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNew}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Building Audit
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 pl-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by facility name, address, or auditor notes..."
              aria-label="Search building assessments"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by building type"
              className="w-full text-xs rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All Facility Types</option>
              {BUILDING_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No building assessments found"
          description={
            searchTerm || selectedType !== "all"
              ? "No assessments match your active search filter. Try clearing your search query or reset filters."
              : "No building audit records exist in local storage. Create your first assessment or restore sample seed data."
          }
          icon={<Building2 className="h-8 w-8 text-slate-400" />}
          action={
            <div className="flex items-center gap-2">
              {(searchTerm || selectedType !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={onResetSampleData}>
                Restore Sample Audits
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((record) => {
            const summary = getEvidenceSummary(record);
            const isDeleting = deletingId === record.id;

            return (
              <Card
                key={record.id}
                variant="default"
                className="hover:border-teal-400/80 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                            {record.general.name}
                          </CardTitle>
                          <Badge variant="teal" size="sm">
                            {getBuildingTypeLabel(record.general.buildingType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate max-w-xs">{record.general.address}</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {record.general.floorsCount ?? 1} Floor(s)
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {record.general.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                        &ldquo;{record.general.notes}&rdquo;
                      </p>
                    )}

                    {/* Quick Architectural Status Badges */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Entrance:{" "}
                        <strong>
                          {record.entrance.stepFreeAccess.value ? "Step-Free" : "Stairs Only"}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Lift:{" "}
                        <strong>
                          {record.internalMovement.elevatorAvailable.value
                            ? record.internalMovement.elevatorOperationalStatus.value === "operational"
                              ? "Active Lift"
                              : "Out of Service"
                            : "No Lift"}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Restroom:{" "}
                        <strong>
                          {record.restroom.accessibleRestroomAvailable.value ? "Accessible" : "Standard Only"}
                        </strong>
                      </span>
                    </div>

                    {/* Evidence Quality Mini Indicator */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> {summary.verified} Verified
                      </span>
                      <span className="flex items-center gap-1 text-sky-700 font-medium">
                        <ShieldCheck className="h-3 w-3" /> {summary.userReported} Reported
                      </span>
                      {summary.unknown > 0 && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <HelpCircle className="h-3 w-3" /> {summary.unknown} Unknown
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-slate-100 p-3 bg-slate-50/60 rounded-b-xl flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    Audited {formatDate(record.general.assessmentDate)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDeleting ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-rose-700 font-medium mr-1">
                          Delete?
                        </span>
                        <Button
                          variant="navy"
                          size="sm"
                          onClick={() => {
                            onDelete(record.id);
                            setDeletingId(null);
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(record.id)}
                          aria-label={`Delete ${record.general.name}`}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(record.id)}
                          leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onSelect(record.id)}
                          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                        >
                          Inspect Audit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
