import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) throw error;

    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email || "",
      name:
        u.user_metadata?.name ||
        u.user_metadata?.full_name ||
        u.email?.split("@")[0] ||
        "Member",
      role: (u.app_metadata?.role as "user" | "admin") || "user",
      createdAt: u.created_at,
    }));

    return NextResponse.json({ users });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }
}
