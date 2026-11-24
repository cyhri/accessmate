"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { AdminAppShell } from "@/components/layout/admin-app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login?redirect=/admin");
      } else if (!isAdmin) {
        router.replace("/unauthorized");
      }
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-xs text-zinc-500 font-mono">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <AdminAppShell>{children}</AdminAppShell>;
}
