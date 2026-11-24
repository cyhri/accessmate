"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
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

export default function AdminAssessmentsPage() {
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
  };

  const handleDelete = (id: string) => {
    const toDelete = assessments.find((a) => a.id === id);
    if (!toDelete) return;

    if (window.confirm(`Are you sure you want to permanently delete the audit for "${toDelete.general.name}"?`)) {
      assessmentRepository.deleteAssessment(id);
      setSelectedId(null);
      setView("list");
      setAlertInfo({
        variant: "info",
        title: "Audit Deleted",
        description: `The assessment record for "${toDelete.general.name}" was removed.`,
      });
    }
  };

  const handleResetSampleData = () => {
    assessmentRepository.resetToSampleData();
    setAssessments(assessmentRepository.getAssessments());
    setSelectedId(null);
    setView("list");
  };

  const selectedAssessment = selectedId
    ? assessments.find((a) => a.id === selectedId) ?? null
    : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
            Building Accessibility Audits
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Structured physical built-environment measurements, evidence confidence grades, and architectural barrier audits.
          </p>
        </div>

        {view === "list" ? (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/buildings/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Audit</span>
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Audits</span>
          </button>
        )}
      </div>

      {alertInfo && (
        <Alert variant={alertInfo.variant}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          <AlertDescription>{alertInfo.description}</AlertDescription>
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

      {view === "detail" && selectedAssessment && (
        <AssessmentDetail
          record={selectedAssessment}
          onBack={() => setView("list")}
          onEdit={() => handleEdit(selectedAssessment.id)}
          onDelete={() => handleDelete(selectedAssessment.id)}
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

      {view === "edit" && selectedAssessment && (
        <AssessmentForm
          initialRecord={selectedAssessment}
          isNew={false}
          onSave={handleSave}
          onCancel={() => setView("detail")}
        />
      )}
    </div>
  );
}
