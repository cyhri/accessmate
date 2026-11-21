"use client";

import React, { useState, useEffect } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  type UserAccessibilityProfile,
  profileRepository,
  getDefaultProfile,
  ProfileForm,
  ProfileSummary,
} from "@/features/profiles";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(() => {
    if (typeof window === "undefined") return getDefaultProfile();
    return profileRepository.getProfile() ?? getDefaultProfile();
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const current = profileRepository.getProfile() ?? getDefaultProfile();
      setProfile(current);
    };

    window.addEventListener("accessmate:profile-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:profile-updated", handleUpdate);
  }, []);

  const handleSave = (updated: UserAccessibilityProfile) => {
    profileRepository.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeading
        title="Personalized Accessibility Profile"
        description="Define individualized functional requirements, mobility aid specifications, and physical tolerance thresholds. Eliminates generic one-size-fits-all labels."
        badge={
          <Badge variant="teal" size="md">
            Phase 3 Active
          </Badge>
        }
      />

      {isEditing ? (
        <ProfileForm
          initialProfile={profile}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileSummary
          profile={profile}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}
