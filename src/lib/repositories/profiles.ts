import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import type { UserAccessibilityProfile } from "@/types/profile";
import { getDefaultProfile } from "@/lib/storage/profile-storage";

export const profilesRepository = {
  /**
   * Fetch accessibility profile for the authenticated user from Supabase.
   */
  async getAccessibilityProfile(userId?: string): Promise<UserAccessibilityProfile | null> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from("accessibility_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Supabase getAccessibilityProfile error:", error.message);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.profile_name || "My Accessibility Profile",
        preferredCategory: (data.mobility_preferences as any)?.preferredCategory || "Standard / Multi-Need",
        notes: (data.mobility_preferences as any)?.notes || "",
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        mobility: (data.mobility_preferences as any)?.mobility || (data.mobility_preferences as any) || getDefaultProfile().mobility,
        vision: (data.vision_preferences as any) || getDefaultProfile().vision,
        hearing: (data.hearing_preferences as any) || getDefaultProfile().hearing,
        sensory: (data.sensory_preferences as any) || getDefaultProfile().sensory,
        temporary: (data.temporary_limitations as any) || getDefaultProfile().temporary,
      };
    } catch (err) {
      console.error("profilesRepository.getAccessibilityProfile unexpected error:", err);
      return null;
    }
  },

  /**
   * Save accessibility preferences to Supabase.
   */
  async saveAccessibilityProfile(
    profile: UserAccessibilityProfile,
    userId?: string
  ): Promise<UserAccessibilityProfile> {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Cannot save profile without an authenticated user.");
      }
      targetUserId = user.id;
    }

    const payload = {
      user_id: targetUserId,
      profile_name: profile.name,
      mobility_preferences: {
        preferredCategory: profile.preferredCategory,
        notes: profile.notes,
        mobility: profile.mobility,
      } as unknown as Json,
      vision_preferences: profile.vision as unknown as Json,
      hearing_preferences: profile.hearing as unknown as Json,
      sensory_preferences: profile.sensory as unknown as Json,
      temporary_limitations: profile.temporary as unknown as Json,
      is_default: profile.isDefault ?? true,
      updated_at: new Date().toISOString(),
    };

    // Check if record exists
    const existing = await this.getAccessibilityProfile(targetUserId);

    if (existing) {
      const { data, error } = await supabase
        .from("accessibility_profiles")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return { ...profile, id: data.id, updatedAt: data.updated_at };
    } else {
      const { data, error } = await supabase
        .from("accessibility_profiles")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { ...profile, id: data.id, createdAt: data.created_at, updatedAt: data.updated_at };
    }
  },

  /**
   * Fetch account user profile (display name, avatar)
   */
  async getAccountProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update display name or avatar in public.profiles
   */
  async updateAccountProfile(userId: string, data: { display_name?: string; avatar_url?: string }) {
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);

    if (error) throw error;
  },
};
