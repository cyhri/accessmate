import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

const DEFAULT_SUPABASE_URL = "https://lduljzvcukjttpheecsq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWxqenZjdWtqdHRwaGVlY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MzQ5MzIsImV4cCI6MjExMTExMDkzMn0.yCGsHirPZKMPgE_rw0P3tGRyYXKc8-ehL4mNWPEPMPw";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Server-side helper to get authenticated user and verify token with auth server.
 * Do not rely on getSession() for authorization decisions!
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Server-side helper to verify admin role.
 * Inspects trusted server-controlled app_metadata.role.
 */
export async function getIsAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) return false;
  return (user.app_metadata?.role as string | undefined) === "admin";
}

/**
 * Guard that throws or redirects if user is not authenticated.
 */
export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return user;
}

/**
 * Guard that throws if user does not possess admin role.
 */
export async function requireAdmin() {
  const user = await requireAuthenticatedUser();
  const role = user.app_metadata?.role as string | undefined;
  if (role !== "admin") {
    throw new Error("Forbidden: Administrator privileges required.");
  }
  return user;
}
