"use client";

import React, { useState, useEffect } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  type UserAccessibilityProfile,
  profileRepository,
  getDefaultProfile,
  ProfileForm,
  ProfileSummary,
} from "@/features/profiles";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(getDefaultProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const current = profileRepository.getProfile() ?? getDefaultProfile();
      setProfile(current);
    };
    handleUpdate();
    window.addEventListener("accessmate:profile-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:profile-updated", handleUpdate);
  }, []);

  const handleSave = (updated: UserAccessibilityProfile) => {
    profileRepository.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <SectionHeading
        title="Accessibility Profile"
        description="Configure your individualized mobility aid measurements, step tolerances, visual contrast requirements, and stamina limits."
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
