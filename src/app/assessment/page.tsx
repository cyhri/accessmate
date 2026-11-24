"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { ArrowRight, Shield } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  type BuildingAssessmentRecord,
  assessmentRepository,
  SAMPLE_BUILDING_ASSESSMENTS,
  createEmptyAssessment,
  AssessmentList,
  AssessmentDetail,
  AssessmentForm,
} from "@/features/assessment";

export default function AssessmentPage() {
  const [view, setView] = useState<"list" | "detail" | "create" | "edit">("list");
  const [assessments, setAssessments] = useState<BuildingAssessmentRecord[]>(SAMPLE_BUILDING_ASSESSMENTS);
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
    handleUpdate();
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
      title: "Audit Saved",
      description: `Accessibility audit for "${record.general.name}" has been recorded.`,
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
      title: "Audit Removed",
      description: target
        ? `Audit record for "${target.general.name}" was deleted.`
        : "Audit record was removed.",
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
      title: "Sample Audits Restored",
      description: "Restored demonstration venues (transit station and civic library).",
    });
    setTimeout(() => setAlertInfo(null), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedRecord = selectedId
    ? assessments.find((a) => a.id === selectedId)
    : undefined;

  return (
    <AdminAppShell>
      <div className="space-y-6 pb-12">
        {/* Admin Navigation Notice */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <span>This is an administrator module. Looking for the integrated audits workflow?</span>
          </div>
          <Link
            href="/admin/assessments"
            className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-900 hover:underline"
          >
            Go to Admin Assessments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Page Title Heading */}
        <SectionHeading
          title="Building & Facility Audits"
          description="Inspect verified physical built-environment measurements, entrance specifications, elevator availability, and evidence confidence tiers."
        />

        {/* Global Action Alerts */}
        {alertInfo && (
          <Alert variant={alertInfo.variant} className="transition-opacity animate-in fade-in">
            <AlertTitle>{alertInfo.title}</AlertTitle>
            <AlertDescription>{alertInfo.description}</AlertDescription>
          </Alert>
        )}

        {/* View Orchestration */}
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
            onBack={() => setView("list")}
            onEdit={() => handleEdit(selectedRecord.id)}
            onDelete={() => handleDelete(selectedRecord.id)}
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
          />
        )}
      </div>
    </AdminAppShell>
  );
}
