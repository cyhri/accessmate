"use client";

import React, { useState } from "react";
import { Eye, ShieldCheck, User, LogOut, Volume2, MapPin, Check } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media-query";
import { useAuth } from "@/features/auth";
import { UserAppShell } from "@/components/layout/user-app-shell";

export default function SettingsPage() {
  const isReducedMotion = useReducedMotion();
  const { user, logout } = useAuth();
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [highContrastMap, setHighContrastMap] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    try {
      localStorage.removeItem("accessmate_user_profile");
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch {
      // Ignore if localStorage unavailable
    }
  };

  return (
    <UserAppShell>
      <div className="p-4 sm:p-6 lg:p-7 max-w-4xl mx-auto w-full space-y-6 pb-16">
        {/* Minimal Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111110] font-display">
            Settings &amp; Preferences
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your personal navigation preferences, audio guidance, display options, and account.
          </p>
        </div>

        {resetSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Profile and map preferences reset to default.</span>
          </div>
        )}

        {/* User Account Info */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 block font-mono">
            User Account
          </span>
          <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs divide-y divide-black/[0.04]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200/60">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#111110] block">
                    {user?.name ?? "Guest User"}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {user?.email ?? "Not signed in"} &bull; Role: {user?.role ?? "guest"}
                  </span>
                </div>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation & Voice Preferences */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 block font-mono">
            Navigation Guidance
          </span>
          <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs divide-y divide-black/[0.04]">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#111110] block">
                    Voice Turn-by-Turn Announcements
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Speaks upcoming manoeuvres and community hazard warnings aloud
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoiceGuidance(!voiceGuidance)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  voiceGuidance ? "bg-teal-600 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {voiceGuidance ? "Enabled" : "Muted"}
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#111110] block">
                    High-Contrast Route Geometry
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Emphasizes wheelchair accessible path borders with high-contrast outlines
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHighContrastMap(!highContrastMap)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  highContrastMap ? "bg-teal-600 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {highContrastMap ? "Active" : "Off"}
              </button>
            </div>
          </div>
        </div>

        {/* Display & Motion */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1 block font-mono">
            Display &amp; Motion
          </span>
          <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs divide-y divide-black/[0.04]">
            <div className="p-4 flex items-center justify-between">
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

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#111110] block">
                    Location &amp; GPS Privacy
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    GPS coordinates are only processed locally for on-device navigation; no location tracking history is stored.
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-medium">
                Protected
              </span>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-rose-700 hover:bg-rose-50 border border-zinc-200 transition-colors cursor-pointer"
          >
            Reset Cached Profile &amp; Preferences
          </button>
        </div>
      </div>
    </UserAppShell>
  );
}
