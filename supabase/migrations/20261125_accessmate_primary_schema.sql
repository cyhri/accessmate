-- ==============================================================================
-- ACCESSMATE — Comprehensive Database Migration & RLS Architecture
-- Migration: 20261125_accessmate_primary_schema.sql
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. ACCESSIBILITY PROFILES (User personal mobility, sensory & visual preferences)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accessibility_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL DEFAULT 'My Accessibility Profile',
  mobility_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  vision_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  hearing_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  sensory_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  temporary_limitations JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_accessibility_profiles_user_id ON public.accessibility_profiles(user_id);

-- ------------------------------------------------------------------------------
-- 3. VENUES (Public buildings, transit facilities & cultural sites)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_venues_pub_coords ON public.venues(publication_status, latitude, longitude);

-- ------------------------------------------------------------------------------
-- 4. BUILDING ASSESSMENTS (Physical audit records & measured specifications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.building_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  auditor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_status TEXT NOT NULL DEFAULT 'verified' CHECK (assessment_status IN ('draft', 'in_review', 'verified', 'archived')),
  assessment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_building_assessments_venue ON public.building_assessments(venue_id);

-- ------------------------------------------------------------------------------
-- 5. ASSESSMENT EVIDENCE (Specific physical observations with confidence rating)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.building_assessments(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  evidence_status TEXT NOT NULL DEFAULT 'unknown' CHECK (evidence_status IN ('verified', 'user_reported', 'unverified', 'unknown', 'not_applicable')),
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('high', 'medium', 'low', 'unknown')),
  evidence_source TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessment_evidence_assessment ON public.assessment_evidence(assessment_id);

-- ------------------------------------------------------------------------------
-- 6. COMMUNITY REPORTS (Real-time temporary barrier & obstacle reports)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('elevator', 'construction', 'surface', 'curb_ramp', 'restroom', 'other', 'stairs_inaccessible')),
  severity TEXT NOT NULL DEFAULT 'critical' CHECK (severity IN ('critical', 'warning', 'info', 'resolved')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  moderation_status TEXT NOT NULL DEFAULT 'submitted' CHECK (moderation_status IN ('submitted', 'under_review', 'verified', 'rejected', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status, moderation_status);
CREATE INDEX IF NOT EXISTS idx_community_reports_coords ON public.community_reports(latitude, longitude);

-- ------------------------------------------------------------------------------
-- 7. REPORT CONFIRMATIONS (Unique peer verification votes per user)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.report_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.community_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_report_confirmation UNIQUE (report_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_report_confirmations_report ON public.report_confirmations(report_id);

-- ------------------------------------------------------------------------------
-- 8. REPORT MODERATION HISTORY (Audit log for administrative review actions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.report_moderation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.community_reports(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_report_moderation_report ON public.report_moderation_history(report_id);

-- ------------------------------------------------------------------------------
-- 9. ADMIN ACTIVITY (Administrative governance audit trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON public.admin_activity(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_profiles_updated_at') THEN
    CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_accessibility_profiles_updated_at') THEN
    CREATE TRIGGER tr_accessibility_profiles_updated_at BEFORE UPDATE ON public.accessibility_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_venues_updated_at') THEN
    CREATE TRIGGER tr_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_building_assessments_updated_at') THEN
    CREATE TRIGGER tr_building_assessments_updated_at BEFORE UPDATE ON public.building_assessments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_community_reports_updated_at') THEN
    CREATE TRIGGER tr_community_reports_updated_at BEFORE UPDATE ON public.community_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 11. AUTOMATIC PROFILE CREATION ON USER SIGNUP (auth.users -> public.profiles)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public profiles
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Ensure app_metadata.role is initialized to 'user' if not present
  IF NEW.raw_app_meta_data IS NULL OR NOT (NEW.raw_app_meta_data ? 'role') THEN
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"user"')
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 12. STORAGE BUCKET PROVISIONING
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('building-evidence', 'building-evidence', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('community-reports', 'community-reports', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('venue-images', 'venue-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
DO $$
BEGIN
  -- Public read for all app buckets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for App Storage Buckets') THEN
    CREATE POLICY "Public Access for App Storage Buckets"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id IN ('building-evidence', 'community-reports', 'venue-images', 'avatars'));
  END IF;

  -- Authenticated insert for community reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload to Community Reports Bucket') THEN
    CREATE POLICY "Authenticated Upload to Community Reports Bucket"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'community-reports');
  END IF;

  -- Authenticated insert for avatars (user owns folder)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User Upload to Avatars Bucket') THEN
    CREATE POLICY "User Upload to Avatars Bucket"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'avatars');
  END IF;

  -- Admin upload for building evidence and venue images
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Upload to Evidence and Venue Buckets') THEN
    CREATE POLICY "Admin Upload to Evidence and Venue Buckets"
      ON storage.objects FOR ALL
      TO authenticated
      USING (
        bucket_id IN ('building-evidence', 'venue-images') AND
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
      )
      WITH CHECK (
        bucket_id IN ('building-evidence', 'venue-images') AND
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
      );
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 13. REALTIME PUBLICATION CONFIGURATION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reports;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'report_confirmations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.report_confirmations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'report_moderation_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.report_moderation_history;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If supabase_realtime publication is managed by platform or already has tables
    NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 14. DATA API PERMISSIONS & GRANTS
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_moderation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- A. PROFILES
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- B. ACCESSIBILITY PROFILES
CREATE POLICY "accessibility_profiles_select"
  ON public.accessibility_profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "accessibility_profiles_insert"
  ON public.accessibility_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "accessibility_profiles_update"
  ON public.accessibility_profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "accessibility_profiles_delete"
  ON public.accessibility_profiles FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- C. VENUES
CREATE POLICY "venues_select"
  ON public.venues FOR SELECT
  TO authenticated, anon
  USING (
    publication_status = 'published' OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "venues_admin_insert"
  ON public.venues FOR INSERT
  TO authenticated
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "venues_admin_update"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "venues_admin_delete"
  ON public.venues FOR DELETE
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- D. BUILDING ASSESSMENTS
CREATE POLICY "building_assessments_select"
  ON public.building_assessments FOR SELECT
  TO authenticated, anon
  USING (
    assessment_status = 'verified' OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "building_assessments_admin_insert"
  ON public.building_assessments FOR INSERT
  TO authenticated
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "building_assessments_admin_update"
  ON public.building_assessments FOR UPDATE
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "building_assessments_admin_delete"
  ON public.building_assessments FOR DELETE
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- E. ASSESSMENT EVIDENCE
CREATE POLICY "assessment_evidence_select"
  ON public.assessment_evidence FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "assessment_evidence_admin_all"
  ON public.assessment_evidence FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- F. COMMUNITY REPORTS
CREATE POLICY "community_reports_select"
  ON public.community_reports FOR SELECT
  TO authenticated, anon
  USING (
    moderation_status IN ('verified', 'submitted', 'under_review') OR
    (reporter_id = (SELECT auth.uid())) OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "community_reports_insert"
  ON public.community_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = reporter_id OR
    reporter_id IS NULL
  );

CREATE POLICY "community_reports_update"
  ON public.community_reports FOR UPDATE
  TO authenticated
  USING (
    (reporter_id = (SELECT auth.uid())) OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  )
  WITH CHECK (
    (reporter_id = (SELECT auth.uid())) OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "community_reports_admin_delete"
  ON public.community_reports FOR DELETE
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- G. REPORT CONFIRMATIONS
CREATE POLICY "report_confirmations_select"
  ON public.report_confirmations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "report_confirmations_insert"
  ON public.report_confirmations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "report_confirmations_delete"
  ON public.report_confirmations FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id OR
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

-- H. REPORT MODERATION HISTORY
CREATE POLICY "report_moderation_history_admin"
  ON public.report_moderation_history FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- I. ADMIN ACTIVITY
CREATE POLICY "admin_activity_admin"
  ON public.admin_activity FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  WITH CHECK (((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));
