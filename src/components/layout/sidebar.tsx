"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UserCheck,
  Navigation,
  Building2,
  MessageSquareWarning,
  Settings,
  Cpu,
  Compass,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { profileRepository, getDefaultProfile } from "@/features/profiles";
import type { UserAccessibilityProfile } from "@/types/profile";

const ICON_MAP = {
  LayoutDashboard,
  UserCheck,
  Navigation,
  Building2,
  MessageSquareWarning,
  Settings,
  Cpu,
} as const;

export interface SidebarProps {
  readonly onNavigate?: () => void;
  readonly className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserAccessibilityProfile | null>(null);

  useEffect(() => {
    const update = () => {
      setProfile(profileRepository.getProfile() ?? getDefaultProfile());
    };
    update();
    window.addEventListener("accessmate:profile-updated", update);
    return () => window.removeEventListener("accessmate:profile-updated", update);
  }, []);

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={cn(
        "flex h-full flex-col justify-between bg-[#fbfbfa]/90 text-zinc-800 border-r border-black/[0.06] w-[230px] select-none backdrop-blur-md",
        className
      )}
    >
      <div>
        {/* Apple-style clean Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-black/[0.04]">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg p-1 transition-all hover:opacity-85"
            aria-label={`${siteConfig.name} Home`}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111110] text-white font-bold text-xs shadow-xs tracking-tight"
              aria-hidden="true"
            >
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[#111110] text-sm leading-none">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5 tracking-normal">
                Mobility &amp; Access
              </span>
            </div>
          </Link>
        </div>

        {/* Quiet Navigation Rail */}
        <nav className="p-2 space-y-0.5" aria-label="Primary Navigation">
          {siteConfig.mainNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = ICON_MAP[item.iconName];

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                  isActive
                    ? "text-[#111110] font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03]"
                )}
              >
                {/* Smooth animated active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-white border border-black/[0.06] shadow-2xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-[#111110]" : "text-zinc-400 group-hover:text-zinc-700"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Compact Active Profile Control at Bottom */}
      <div className="p-3 border-t border-black/[0.04]">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center justify-between p-2 rounded-xl bg-white border border-black/[0.05] hover:border-black/[0.1] hover:shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="h-6 w-6 rounded-full bg-zinc-100 border border-black/[0.05] text-[#111110] flex items-center justify-center font-bold text-[10px] shrink-0">
              {profile ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-semibold text-[#111110] truncate">
                {profile ? profile.name : "Active Profile"}
              </span>
              <span className="text-[9px] text-zinc-400 truncate capitalize">
                {profile ? profile.preferredCategory.replace(/_/g, " ") : "Configured"}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
            Active
          </span>
        </Link>
      </div>
    </aside>
  );
}
