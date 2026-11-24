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
import { profilesRepository } from "@/lib/repositories/profiles";
import { UserAppShell } from "@/components/layout/user-app-shell";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserAccessibilityProfile>(getDefaultProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const remote = await profilesRepository.getAccessibilityProfile();
        if (remote) {
          setProfile(remote);
          profileRepository.saveProfile(remote);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch remote profile:", err);
      }
      const current = profileRepository.getProfile() ?? getDefaultProfile();
      setProfile(current);
    }

    loadProfile();

    const handleUpdate = () => {
      const current = profileRepository.getProfile() ?? getDefaultProfile();
      setProfile(current);
    };
    window.addEventListener("accessmate:profile-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:profile-updated", handleUpdate);
  }, []);

  const handleSave = async (updated: UserAccessibilityProfile) => {
    profileRepository.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    try {
      await profilesRepository.saveAccessibilityProfile(updated);
    } catch (err) {
      console.warn("Saved locally, Supabase sync:", err);
    }
  };

  return (
    <UserAppShell>
      <div className="p-4 sm:p-6 lg:p-7 max-w-4xl mx-auto w-full space-y-6 pb-16">
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
    </UserAppShell>
  );
}
