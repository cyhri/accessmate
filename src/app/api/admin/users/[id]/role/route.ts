import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/features/auth/types";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const caller = await requireAdmin();
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams.id;
    const body = await request.json();
    const { role } = body as { role: UserRole };

    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: userToUpdate, error: getErr } = await adminClient.auth.admin.getUserById(id);
    if (getErr || !userToUpdate.user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Safety: prevent demoting the sole remaining administrator
    if (userToUpdate.user.app_metadata?.role === "admin" && role !== "admin") {
      const { data: allUsers } = await adminClient.auth.admin.listUsers();
      const adminCount = (allUsers?.users || []).filter(
        (u) => u.app_metadata?.role === "admin"
      ).length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot revoke admin status from the only remaining administrator." },
          { status: 400 }
        );
      }
    }

    const { data: updated, error: updateErr } = await adminClient.auth.admin.updateUserById(id, {
      app_metadata: {
        ...userToUpdate.user.app_metadata,
        role,
      },
    });

    if (updateErr || !updated.user) {
      return NextResponse.json(
        { error: updateErr?.message || "Failed to update role." },
        { status: 500 }
      );
    }

    // Record administrative action in admin_activity
    try {
      await adminClient.from("admin_activity").insert({
        admin_id: caller.id,
        action: "UPDATE_USER_ROLE",
        entity_type: "user",
        entity_id: id,
        metadata: { targetEmail: updated.user.email, newRole: role },
      });
    } catch (auditErr) {
      console.warn("Notice: could not record admin activity entry:", auditErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.user.id,
        email: updated.user.email,
        name: updated.user.user_metadata?.name || updated.user.email?.split("@")[0],
        role,
        createdAt: updated.user.created_at,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }
}
