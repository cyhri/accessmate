"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  type BuildingAssessmentRecord,
  assessmentRepository,
  createEmptyAssessment,
  AssessmentList,
  AssessmentDetail,
  AssessmentForm,
} from "@/features/assessment";

export default function AssessmentPage() {
  const [view, setView] = useState<"list" | "detail" | "create" | "edit">("list");
  const [assessments, setAssessments] = useState<BuildingAssessmentRecord[]>(() => {
    if (typeof window === "undefined") return [];
    return assessmentRepository.getAssessments();
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "info" | "error";
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setAssessments(assessmentRepository.getAssessments());
    };

    window.addEventListener("accessmate:assessments-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:assessments-updated", handleUpdate);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setView("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = (record: BuildingAssessmentRecord) => {
    assessmentRepository.saveAssessment(record);
    setSelectedId(record.id);
    setView("detail");
    setAlertInfo({
      variant: "success",
      title: "Assessment Record Saved",
      description: `Successfully persisted accessibility audit for "${record.general.name}".`,
    });
    setTimeout(() => setAlertInfo(null), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    const target = assessments.find((a) => a.id === id);
    assessmentRepository.deleteAssessment(id);
    setSelectedId(null);
    setView("list");
    setAlertInfo({
      variant: "info",
      title: "Assessment Deleted",
      description: target
        ? `Assessment record for "${target.general.name}" was removed.`
        : "Assessment record was removed.",
    });
    setTimeout(() => setAlertInfo(null), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetSampleData = () => {
    assessmentRepository.resetToSampleData();
    setAssessments(assessmentRepository.getAssessments());
    setSelectedId(null);
    setView("list");
    setAlertInfo({
      variant: "info",
      title: "Reset to Sample Audits",
      description: "Restored municipal transit hub and heritage library sample assessments.",
    });
    setTimeout(() => setAlertInfo(null), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedRecord = selectedId
    ? assessments.find((a) => a.id === selectedId) ?? null
    : null;

  return (
    <div className="space-y-8 pb-10">
      <SectionHeading
        title="Building &amp; Facility Assessment"
        description="Structured built-environment audits, dimensional measurements, and evidence confidence grading. Never assumes unmeasured parameters to be either present or absent."
        badge={
          <Badge variant="teal" size="md">
            Phase 3 Active
          </Badge>
        }
      />

      {alertInfo && (
        <Alert variant={alertInfo.variant} icon={<CheckCircle2 className="h-5 w-5 text-teal-600" />}>
          <div className="font-semibold">{alertInfo.title}</div>
          <div className="text-xs">{alertInfo.description}</div>
        </Alert>
      )}

      {view === "list" && (
        <AssessmentList
          assessments={assessments}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
          onResetSampleData={handleResetSampleData}
        />
      )}

      {view === "detail" && selectedRecord && (
        <AssessmentDetail
          record={selectedRecord}
          onEdit={() => setView("edit")}
          onDelete={handleDelete}
          onBack={() => setView("list")}
        />
      )}

      {view === "create" && (
        <AssessmentForm
          initialRecord={createEmptyAssessment()}
          isNew={true}
          onSave={handleSave}
          onCancel={() => setView("list")}
        />
      )}

      {view === "edit" && selectedRecord && (
        <AssessmentForm
          initialRecord={selectedRecord}
          isNew={false}
          onSave={handleSave}
          onCancel={() => setView("detail")}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
