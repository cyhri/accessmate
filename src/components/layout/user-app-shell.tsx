"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  MapPin,
  AlertTriangle,
  User,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";

interface UserAppShellProps {
  children: React.ReactNode;
}

const USER_NAV = [
  { label: "Map & Navigation", href: "/map", icon: MapPin },
  { label: "Community Reports", href: "/reports", icon: AlertTriangle },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function UserAppShell({ children }: UserAppShellProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#111110] flex flex-col font-sans antialiased selection:bg-teal-500/15 selection:text-teal-900">
      {/* Top Floating Glass Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] bg-[#fbfbfa]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/map"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg p-1 transition-opacity hover:opacity-85"
            >
              <div className="h-7 w-7 rounded-lg bg-[#111110] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Compass className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-[#111110] text-sm leading-none font-display">
                  ACCESSMATE
                </span>
                <span className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5">
                  Accessible Mobility
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="User Navigation">
              {USER_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href === "/map" && pathname === "/routes");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      isActive
                        ? "bg-[#111110] text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Status & Admin Switcher */}
          <div className="flex items-center gap-2">
            {/* If signed in user has admin role, show subtle switch to admin workspace */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 transition-all cursor-pointer shadow-xs"
                title="Switch to Administrator Panel"
              >
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                <span>Admin Panel</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-black/[0.08]">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-[#111110] leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 capitalize">
                    {user.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-black/[0.04] transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#111110] text-white hover:bg-zinc-800 transition-all shadow-xs"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-black/[0.04]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] bg-[#fbfbfa] px-4 py-3 space-y-1">
            {USER_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href === "/map" && pathname === "/routes");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                    isActive
                      ? "bg-[#111110] text-white font-semibold"
                      : "text-zinc-600 hover:bg-black/[0.03]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 mt-2"
              >
                <Shield className="h-4 w-4" />
                <span>Switch to Admin Panel</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">{children}</main>
    </div>
  );
}
