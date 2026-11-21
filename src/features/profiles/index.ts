/**
 * Feature Module: Accessibility Profiles (Phase 3 Active)
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export * from "@/types/profile";
export { profileRepository, getDefaultProfile } from "@/lib/storage/profile-storage";
export { PROFILE_PRESETS } from "./profile-presets";
export type { ProfilePreset } from "./profile-presets";
export { ProfileForm } from "./components/profile-form";
export { ProfileSummary } from "./components/profile-summary";
export { RequirementSelector } from "./components/requirement-selector";
