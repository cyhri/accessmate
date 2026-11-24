export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[]
  | Record<string, unknown>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accessibility_profiles: {
        Row: {
          id: string;
          user_id: string;
          profile_name: string;
          mobility_preferences: Json;
          vision_preferences: Json;
          hearing_preferences: Json;
          sensory_preferences: Json;
          temporary_limitations: Json;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_name?: string;
          mobility_preferences?: Json;
          vision_preferences?: Json;
          hearing_preferences?: Json;
          sensory_preferences?: Json;
          temporary_limitations?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_name?: string;
          mobility_preferences?: Json;
          vision_preferences?: Json;
          hearing_preferences?: Json;
          sensory_preferences?: Json;
          temporary_limitations?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          address: string;
          latitude: number;
          longitude: number;
          publication_status: "draft" | "published" | "archived";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string;
          address: string;
          latitude: number;
          longitude: number;
          publication_status?: "draft" | "published" | "archived";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          publication_status?: "draft" | "published" | "archived";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      building_assessments: {
        Row: {
          id: string;
          venue_id: string;
          auditor_id: string | null;
          assessment_status: "draft" | "in_review" | "verified" | "archived";
          assessment_data: Json;
          audit_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          auditor_id?: string | null;
          assessment_status?: "draft" | "in_review" | "verified" | "archived";
          assessment_data?: Json;
          audit_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          auditor_id?: string | null;
          assessment_status?: "draft" | "in_review" | "verified" | "archived";
          assessment_data?: Json;
          audit_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_evidence: {
        Row: {
          id: string;
          assessment_id: string;
          field_key: string;
          value: Json;
          evidence_status: "verified" | "user_reported" | "unverified" | "unknown" | "not_applicable";
          confidence_level: "high" | "medium" | "low" | "unknown" | null;
          evidence_source: string | null;
          attachment_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          field_key: string;
          value?: Json;
          evidence_status?: "verified" | "user_reported" | "unverified" | "unknown" | "not_applicable";
          confidence_level?: "high" | "medium" | "low" | "unknown" | null;
          evidence_source?: string | null;
          attachment_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          field_key?: string;
          value?: Json;
          evidence_status?: "verified" | "user_reported" | "unverified" | "unknown" | "not_applicable";
          confidence_level?: "high" | "medium" | "low" | "unknown" | null;
          evidence_source?: string | null;
          attachment_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      community_reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          venue_id: string | null;
          title: string;
          description: string | null;
          category: string;
          severity: string;
          latitude: number;
          longitude: number;
          status: "active" | "resolved" | "archived";
          moderation_status: "submitted" | "under_review" | "verified" | "rejected" | "resolved";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          venue_id?: string | null;
          title: string;
          description?: string | null;
          category: string;
          severity?: string;
          latitude: number;
          longitude: number;
          status?: "active" | "resolved" | "archived";
          moderation_status?: "submitted" | "under_review" | "verified" | "rejected" | "resolved";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          venue_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string;
          severity?: string;
          latitude?: number;
          longitude?: number;
          status?: "active" | "resolved" | "archived";
          moderation_status?: "submitted" | "under_review" | "verified" | "rejected" | "resolved";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      report_confirmations: {
        Row: {
          id: string;
          report_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      report_moderation_history: {
        Row: {
          id: string;
          report_id: string;
          admin_id: string | null;
          previous_status: string;
          new_status: string;
          moderation_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          admin_id?: string | null;
          previous_status: string;
          new_status: string;
          moderation_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          admin_id?: string | null;
          previous_status?: string;
          new_status?: string;
          moderation_notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_activity: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
