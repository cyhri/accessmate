import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Server-only administrative Supabase client.
 * Uses the secret service_role key to bypass RLS for administrative governance,
 * role provisioning, and audit synchronization.
 *
 * CRITICAL: NEVER import this file in client-side components!
 */
const DEFAULT_SUPABASE_URL = "https://lduljzvcukjttpheecsq.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWxqenZjdWtqdHRwaGVlY3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUzNDkzMiwiZXhwIjoyMTExMTEwOTMyfQ.yTVGLOVJ-rk7VgnaMMmEEetUG3L6m8-ojFUg5PYZHOo";

export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SERVICE_ROLE_KEY;

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
