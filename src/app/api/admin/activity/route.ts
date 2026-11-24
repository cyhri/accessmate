import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("admin_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ activity: data || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }
}
