# ACCESSMATE — Personalized Accessibility & Mobility Decision-Support System

> **Production Platform: Centralized Supabase Backend, Dual-Panel Architecture, 3D Vector Navigation & Expert Inference Engine**  
> An expert decision-support platform designed to evaluate environmental compatibility between individual accessibility requirements and physical built environments or transit paths.

---

## 1. Project Overview & Architecture

**ACCESSMATE** is a full-stack, knowledge-based accessibility and mobility platform built with two distinct application experiences powered by a unified **Supabase PostgreSQL** backend:

1. **USER PANEL (`/map`, `/reports`, `/profile`, `/settings`):**  
   Designed for everyday pedestrians, wheelchair users, and travelers requiring accessible mobility guidance:
   - **Interactive 3D Vector Map:** Powered by MapLibre GL, OpenFreeMap vector styles (`liberty`), and true 3D extruded building models.
   - **Pedestrian & Wheelchair Routing:** Mapped pedestrian geometry using OpenRouteService with incline limits, step-free corridors, and surface analysis.
   - **Turn-by-Turn GPS Navigation:** Active tracking with real-time waypoint progression, remaining distance/ETA calculation, and automatic rerouting on deviation.
   - **Directional Along-Route Hazard Alerts:** Vector corridor geometry checks (`corridor < 35m`, forward `dot product > 0.2`) alerting users to obstacles directly ahead while suppressing hazards behind them.
   - **Community Obstacle Reporting:** Map-click coordinate picker or current GPS position, obstacle categorization, severity tagging, and peer confirmation.
   - **Personalized Accessibility Profile:** Configurable physical, visual, and sensory tolerances persisted in Supabase `accessibility_profiles`.

2. **ADMIN PANEL (`/admin/*`):**  
   Designed for accessibility auditors, venue managers, and operations teams:
   - **Operations Dashboard (`/admin`):** Live database metrics for venues, audits, community reports, barrier severity, and moderation activity.
   - **Venue Management (`/admin/venues`):** Register and maintain public transit hubs, civic buildings, and parks directly in `public.venues`.
   - **Building Accessibility Audits (`/admin/assessments`, `/admin/buildings/new`):** Author physical built-environment audits across entrance clearances, ramps, elevators, and evidence confidence tiers.
   - **Expert Inference Engine (`/admin/expert-assessment`):** Forward-chaining rule engine cross-referencing user profiles against venue audits with transparent decision traces.
   - **Report Moderation Workspace (`/admin/reports`):** Full moderation lifecycle (`submitted` → `under_review` → `verified` / `rejected` / `resolved`) with immutable audit logging in `report_moderation_history`.
   - **User & Role Management (`/admin/users`):** RBAC administration promoting or demoting members via `app_metadata.role` with sole-admin protection.
   - **System Diagnostics (`/admin/settings`):** Infrastructure monitoring (tile server, routing API, RLS status, database health).

---

## 2. Supabase Primary Backend Architecture

ACCESSMATE utilizes the official `@supabase/ssr` cookie-based architecture:

```
src/
  lib/
    supabase/
      client.ts     # Browser client (createBrowserClient) using publishable/anon key
      server.ts     # Server client (createServerClient) with cookie storage & requireAuth/requireAdmin
      proxy.ts      # Edge session refresh & authorization proxy for Next.js middleware
      admin.ts      # Privileged server-only client (SUPABASE_SECRET_KEY) for administrative tasks
      storage.ts    # Storage client for uploads across buckets (building-evidence, community-reports, etc.)
      types.ts      # Complete TypeScript database types matching PostgreSQL schema
    repositories/
      profiles.ts   # Accessibility & user profile persistence
      venues.ts     # Venues CRUD & Realtime subscriptions
      assessments.ts# Building audits & physical features
      reports.ts    # Hazard reports, deduplicated confirmations & moderation
```

### Server vs Browser Key Safety
- **Browser Client:** Consumes only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Server Administrative Operations:** Consumes `SUPABASE_SECRET_KEY` strictly inside server actions or protected API endpoints. `SUPABASE_SECRET_KEY` is **never** bundled or exposed to the client.

---

## 3. Database Schema & PostgreSQL Migrations

The database migration is located at:
```
supabase/migrations/20261125_accessmate_primary_schema.sql
```

### Managed Tables

| Table | Description | Primary Key / Constraints |
| :--- | :--- | :--- |
| `profiles` | User accounts, display names, avatars | `id UUID REFERENCES auth.users(id)` |
| `accessibility_profiles` | Personal mobility, sensory & visual tolerances | `id UUID`, `user_id UUID REFERENCES auth.users` |
| `venues` | Public destinations & transit hubs | `id UUID`, indexed by `(publication_status, latitude, longitude)` |
| `building_assessments` | Measured built-environment audits | `id UUID`, `venue_id UUID REFERENCES venues` |
| `assessment_evidence` | Specific observations with confidence rating | `id UUID`, `assessment_id UUID REFERENCES building_assessments` |
| `community_reports` | Temporary hazards & barriers | `id UUID`, indexed by `(status, moderation_status)` |
| `report_confirmations` | Unique peer verification votes | `UNIQUE(report_id, user_id)` (prevents double voting) |
| `report_moderation_history` | Moderation audit log | `id UUID`, `report_id UUID REFERENCES community_reports` |
| `admin_activity` | Platform governance audit trail | `id UUID`, `admin_id UUID REFERENCES auth.users` |

---

## 4. Row Level Security (RLS) & Role System

Row Level Security is enabled on **every** table in the `public` schema (25 active policies):

- **User Privileges:**
  - Read own account profile & update own editable fields.
  - Create and manage own accessibility profiles (`(SELECT auth.uid()) = user_id`).
  - Read published venues & verified building assessments.
  - Submit community reports & read own submissions or verified public reports.
  - Confirm any report at most once (enforced by `uq_report_confirmation` constraint and RLS).
- **Admin Privileges:**
  - Admin RLS policies evaluate `((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')`.
  - User-editable `user_metadata` is **never** trusted for authorization decisions.
  - Full CRUD on venues, building assessments, assessment evidence, and moderation history.

### Provisioning the First Administrator

Ordinary registrations always receive the `user` role by default. To provision or promote an administrator safely from the server:

```bash
# Provision or promote an administrator via server script (requires SUPABASE_SECRET_KEY)
node scripts/provision-admin.mjs admin@accessmate.org
```

This operation:
1. Locates the registered account in Supabase Auth.
2. Updates `app_metadata.role = 'admin'` using the privileged admin client.
3. Synchronizes the user profile in `public.profiles`.
4. Records an audit event in `public.admin_activity`.

---

## 5. Supabase Storage & Realtime

### Storage Buckets
- `building-evidence`: Photos and audit documentation (Max 10MB; JPEG, PNG, WebP, PDF).
- `community-reports`: Photos of temporary barriers attached to user reports (Max 10MB).
- `venue-images`: High-resolution imagery for transit hubs and civic buildings.
- `avatars`: User profile avatars (Max 5MB).

### Realtime Subscriptions
The `supabase_realtime` publication includes:
- `community_reports`: Broadcasts newly reported obstacles and status updates immediately to all connected clients.
- `report_confirmations`: Broadcasts verification count changes.
- `report_moderation_history`: Broadcasts moderation status changes.

---

## 6. Pre-configured Testing Accounts

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@accessmate.org` | `Admin123!` | Access to `/admin/*`, venue management, building audits, expert rules, report moderation, user promotion. |
| **Standard User** | `user@accessmate.org` | `User123!` | Access to `/map`, live routing, GPS navigation, obstacle reporting, personal profile, and settings. |

---

## 7. Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure the following variables are configured:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-or-publishable-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-or-publishable-key"
SUPABASE_SECRET_KEY="your-service-role-key"
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
NEXT_PUBLIC_ORS_API_KEY="your-ors-api-key"
```

### 3. Apply Database Migrations
```bash
node scripts/apply-migration.mjs
```

### 4. Seed Initial Records
```bash
node scripts/seed-supabase.mjs
```

### 5. Run Test Suite
```bash
npm test
```

### 6. Run Typecheck
```bash
npm run typecheck
```

### 7. Run Next.js Build
```bash
npm run build
```
