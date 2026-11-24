"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Building2,
  FilePlus2,
  Cpu,
  AlertTriangle,
  MapPin,
  Users,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";

interface AdminAppShellProps {
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Venues Registry", href: "/admin/venues", icon: MapPin },
  { label: "Building Audits", href: "/admin/assessments", icon: Building2 },
  { label: "New Building Audit", href: "/admin/buildings/new", icon: FilePlus2 },
  { label: "Expert Assessment", href: "/admin/expert-assessment", icon: Cpu },
  { label: "Report Moderation", href: "/admin/reports", icon: AlertTriangle },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Admin Settings", href: "/admin/settings", icon: Settings },
];

export function AdminAppShell({ children }: AdminAppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active page title
  const activeItem = ADMIN_NAV.find((item) => item.href === pathname) ?? ADMIN_NAV[0];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#111110] flex flex-col font-sans antialiased">
      {/* Admin Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-white border-r border-zinc-200 shadow-xs">
        {/* Brand */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-zinc-900 text-sm leading-none font-display">
                  ACCESSMATE
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                Operations &amp; Audit Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Rail */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 py-1 font-mono">
            Platform Management
          </div>

          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  isActive
                    ? "bg-zinc-900 text-white font-semibold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & User Panel switch */}
        <div className="p-3 border-t border-zinc-200 space-y-2">
          <Link
            href="/map"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-all shadow-2xs"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
              <span>Open User Map</span>
            </span>
            <ChevronRight className="h-3 w-3 text-teal-500" />
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                <Shield className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-900 text-xs truncate">
                  {user?.name || "Administrator"}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {user?.email || "admin@accessmate.org"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Wrapper Offset */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Compact Admin Top Header */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Admin</span>
              <span className="text-zinc-300">/</span>
              <span className="font-semibold text-zinc-900">{activeItem?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/map"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
            >
              <span>User Panel</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
              <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200">
                <span className="text-xs font-bold text-zinc-900">Admin Navigation</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {ADMIN_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-zinc-900 text-white font-semibold"
                          : "text-zinc-600 hover:bg-zinc-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Admin Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
