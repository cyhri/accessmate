import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();
    if (!email || !email.includes("@") || !password) {
      return NextResponse.json({ error: "Valid email and password are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
          full_name: name || email.split("@")[0],
        },
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Registration failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name || email.split("@")[0],
        role: "user",
        createdAt: data.user.created_at,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}
