"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  createEmptyAssessment,
  assessmentRepository,
  AssessmentForm,
  type BuildingAssessmentRecord,
} from "@/features/assessment";

export default function AdminNewBuildingAuditPage() {
  const router = useRouter();
  const [emptyRecord] = useState<BuildingAssessmentRecord>(createEmptyAssessment);

  const handleSave = (record: BuildingAssessmentRecord) => {
    assessmentRepository.saveAssessment(record);
    router.push(`/admin/assessments?id=${record.id}`);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/assessments"
              className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-display">
              New Building Accessibility Audit
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 ml-6">
            Document physical dimensions, slope measurements, elevator operational metrics, and evidence confidence levels.
          </p>
        </div>
      </div>

      <AssessmentForm
        initialRecord={emptyRecord}
        isNew={true}
        onSave={handleSave}
        onCancel={() => router.push("/admin/assessments")}
      />
    </div>
  );
}
