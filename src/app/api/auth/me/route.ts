import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    const role = (user.app_metadata?.role as string) === "admin" ? "admin" : "user";
    const name =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Member";

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name,
        role,
        createdAt: user.created_at,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
