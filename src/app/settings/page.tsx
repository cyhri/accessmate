"use client";

import React, { useState } from "react";
import { Eye, RefreshCw, ShieldCheck, Info, Check } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media-query";
import { siteConfig } from "@/config/site";

export default function SettingsPage() {
  const isReducedMotion = useReducedMotion();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    try {
      localStorage.clear();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch {
      // Ignore if localStorage unavailable
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Minimal Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111110] font-display">
          Settings &amp; Preferences
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          System motion preferences, local storage cache, and platform architecture specs.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Local storage cache has been reset to defaults.</span>
        </div>
      )}

      {/* Apple Settings Group 1: Display & Motion */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 block">
          Display &amp; Motion
        </span>
        <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs divide-y divide-black/[0.04]">
          <div className="p-4 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#111110] block">
                  Reduced Motion
                </span>
                <span className="text-[11px] text-zinc-500">
                  Respects operating system setting: prefers-reduced-motion
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-medium">
              {isReducedMotion ? "Active" : "Standard"}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#111110] block">
                  Accessibility Contrast &amp; Focus
                </span>
                <span className="text-[11px] text-zinc-500">
                  Enhanced focus indicators with high-contrast outlines
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-medium">
              Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Apple Settings Group 2: Privacy & Storage */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 block">
          Privacy &amp; Local Storage
        </span>
        <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs divide-y divide-black/[0.04]">
          <div className="p-4 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
            <div>
              <span className="text-xs font-semibold text-[#111110] block">
                Local-First Persistence
              </span>
              <span className="text-[11px] text-zinc-500 max-w-md block mt-0.5">
                Profiles and audits remain encrypted in your browser&apos;s local storage. Zero analytics trackers or data selling.
              </span>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Private
            </span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
            <div>
              <span className="text-xs font-semibold text-[#111110] block">
                Reset Client Cache
              </span>
              <span className="text-[11px] text-zinc-500">
                Clears all custom saved profiles and resets building audits to defaults
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Apple Settings Group 3: System Architecture */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 block">
          About AccessMate
        </span>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-[#111110] font-display">{siteConfig.name}</span>
              <span className="text-zinc-500 text-[11px] block">
                v{siteConfig.version} &bull; Next.js 16 + React 19 + Turbopack
              </span>
            </div>
          </div>
          <span className="text-zinc-400 font-mono text-[11px]">MIT Open System</span>
        </div>
      </div>
    </div>
  );
}
