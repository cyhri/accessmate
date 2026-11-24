import { getAuthenticatedUser } from "@/lib/supabase/server";
import type { AuthUser, UserRole } from "./types";

/**
 * Server-side session extractor for Server Components & Route Handlers.
 * Validates cryptographically signed Supabase token against auth server.
 */
export async function getServerSession(): Promise<AuthUser | null> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return null;

    const role = (user.app_metadata?.role as UserRole) || "user";
    const name =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      (user.email ? user.email.split("@")[0] : "Member");

    return {
      id: user.id,
      email: user.email || "",
      name,
      role,
      createdAt: user.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user or throw a 401 unauthorized.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}

/**
 * Require an administrator user or throw a 403 forbidden.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden: Administrator privileges required.");
  }
  return user;
}
