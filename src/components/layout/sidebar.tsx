"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Navigation,
  Building2,
  MessageSquareWarning,
  Settings,
  Code2,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ICON_MAP = {
  LayoutDashboard,
  UserCheck,
  Navigation,
  Building2,
  MessageSquareWarning,
  Settings,
} as const;

export interface SidebarProps {
  readonly onNavigate?: () => void;
  readonly className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={cn(
        "flex h-full flex-col justify-between bg-slate-900 text-slate-100 border-r border-slate-800 w-64 sm:w-72 select-none",
        className
      )}
    >
      {/* Brand & Wordmark */}
      <div className="p-5 border-b border-slate-800/80">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg p-1 transition-colors"
          aria-label={`${siteConfig.name} Home`}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-extrabold text-base shadow-sm ring-1 ring-teal-400/40"
            aria-hidden="true"
          >
            A
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white text-base leading-tight">
              {siteConfig.name}
            </span>
            <span className="text-[11px] font-medium text-teal-400/90 leading-tight">
              Decision-Support System
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1" aria-label="Primary Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {siteConfig.mainNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = ICON_MAP[item.iconName];
          const isReady = item.status === "ready";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900",
                isActive
                  ? "bg-teal-600/20 text-teal-300 font-semibold border-l-3 border-teal-400 pl-2.5"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.title}</span>
              </div>

              {!isReady && (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/90 border border-slate-700/80 rounded px-1.5 py-0.5 shrink-0 ml-2">
                  {item.phase.replace(" Milestone", "").replace("Phase ", "P")}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Metadata */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
        <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-200">System Status</span>
            <Badge variant="teal" size="sm" dot>
              Phase 2 Active
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Application Shell &amp; Design System baseline verified.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>v{siteConfig.version}</span>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded px-1"
          >
            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>GitHub</span>
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </aside>
  );
}
