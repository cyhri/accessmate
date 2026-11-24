-- ==============================================================================
-- ACCESSMATE — Core PostgreSQL Database Schema & Migration
-- Production-Ready Roles, Venues, Assessments, Community Reports & RLS Policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status_type AS ENUM ('submitted', 'under_review', 'verified', 'rejected', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_severity_type AS ENUM ('critical', 'warning', 'info');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE venue_category_type AS ENUM ('transport', 'culture', 'healthcare', 'civic', 'commercial', 'education', 'recreation', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles & Role Assignments Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role_type NOT NULL DEFAULT 'user',
    mobility_profile JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Venues Table (Stable geographic destination registry)
CREATE TABLE IF NOT EXISTS public.venues (
    id TEXT PRIMARY KEY DEFAULT ('ven-' || replace(uuid_generate_v4()::text, '-', '')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category venue_category_type NOT NULL DEFAULT 'civic',
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Building Assessments Table (Linked to Venues)
CREATE TABLE IF NOT EXISTS public.building_assessments (
    id TEXT PRIMARY KEY DEFAULT ('asm-' || replace(uuid_generate_v4()::text, '-', '')),
    venue_id TEXT REFERENCES public.venues(id) ON DELETE SET NULL,
    building_name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    auditor_id UUID REFERENCES public.profiles(id),
    auditor_name TEXT NOT NULL,
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    physical_measurements JSONB NOT NULL,
    evidence_levels JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Community Reports Table
CREATE TABLE IF NOT EXISTS public.community_reports (
    id TEXT PRIMARY KEY DEFAULT ('rep-' || replace(uuid_generate_v4()::text, '-', '')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_by_name TEXT NOT NULL DEFAULT 'Community Reporter',
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity report_severity_type NOT NULL DEFAULT 'warning',
    status report_status_type NOT NULL DEFAULT 'submitted',
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    details TEXT NOT NULL,
    route_impact TEXT NOT NULL,
    confirmation_count INTEGER NOT NULL DEFAULT 1,
    moderation_notes TEXT,
    moderated_by UUID REFERENCES public.profiles(id),
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Report Confirmations Table (Unique constraint prevents spam confirmations)
CREATE TABLE IF NOT EXISTS public.report_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT NOT NULL REFERENCES public.community_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_report_confirmation UNIQUE (report_id, user_id)
);

-- 8. Moderation Audit Logs Table
CREATE TABLE IF NOT EXISTS public.moderation_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT NOT NULL REFERENCES public.community_reports(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES public.profiles(id),
    previous_status report_status_type,
    new_status report_status_type NOT NULL,
    moderation_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Trigger to auto-update confirmation count on community_reports
CREATE OR REPLACE FUNCTION update_report_confirmation_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.community_reports
    SET confirmation_count = (
        SELECT COUNT(*) FROM public.report_confirmations WHERE report_id = NEW.report_id
    ) + 1
    WHERE id = NEW.report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_confirmation_count ON public.report_confirmations;
CREATE TRIGGER trg_update_confirmation_count
AFTER INSERT ON public.report_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_report_confirmation_count();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile or admins can read all"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Venues Policies (Public read for published venues; Admin full control)
CREATE POLICY "Anyone can view published venues"
ON public.venues FOR SELECT
USING (publication_status = 'published' OR public.is_admin());

CREATE POLICY "Only admins can insert venues"
ON public.venues FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update venues"
ON public.venues FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Only admins can delete venues"
ON public.venues FOR DELETE
USING (public.is_admin());

-- Building Assessments Policies
CREATE POLICY "Authenticated users can read assessments"
ON public.building_assessments FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage assessments"
ON public.building_assessments FOR ALL
USING (public.is_admin());

-- Community Reports Policies
CREATE POLICY "Users can read active and verified reports"
ON public.community_reports FOR SELECT
USING (status != 'rejected' OR public.is_admin());

CREATE POLICY "Authenticated users can submit reports"
ON public.community_reports FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND status = 'submitted');

CREATE POLICY "Only admins can update report moderation status"
ON public.community_reports FOR UPDATE
USING (public.is_admin());

-- Confirmations Policies
CREATE POLICY "Users can view confirmations"
ON public.report_confirmations FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can confirm an obstacle once"
ON public.report_confirmations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Moderation Logs Policies
CREATE POLICY "Only admins can access audit logs"
ON public.moderation_audit_logs FOR ALL
USING (public.is_admin());
