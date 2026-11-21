/**
 * Feature Module: Built-Environment Assessments (Phase 3 Active)
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export * from "@/types/assessment";
export {
  assessmentRepository,
  createEmptyAssessment,
  createUnknownEvidence,
} from "@/lib/storage/assessment-storage";
export { SAMPLE_BUILDING_ASSESSMENTS } from "@/lib/storage/sample-data";
export { EvidenceBadge } from "./components/evidence-badge";
export { EvidenceFieldEditor } from "./components/evidence-field-editor";
export { AssessmentForm } from "./components/assessment-form";
export { AssessmentDetail } from "./components/assessment-detail";
export { AssessmentList } from "./components/assessment-list";
