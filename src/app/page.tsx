"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, MapPin, Shield, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/features/auth";

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/map");
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#111110] flex flex-col justify-between p-6 sm:p-10 font-sans">
      {/* Brand Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#111110] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-base leading-none font-display block">
              ACCESSMATE
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Personalized Mobility &amp; Accessibility Decision Support
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#111110] text-white hover:bg-zinc-800 transition-all shadow-xs"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Hero Selection */}
      <div className="max-w-3xl mx-auto w-full my-auto py-12 text-center space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 font-mono">
            Dual Platform Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-[#111110]">
            Accessibility navigation for everyone.<br />
            Operations &amp; audits for administrators.
          </h1>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Real pedestrian &amp; wheelchair routing across verified city pathways, paired with an expert system decision-support audit workspace.
          </p>
        </div>

        {/* Two Doors: User Panel vs Admin Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
          {/* User Door */}
          <Link
            href="/map"
            className="group p-6 rounded-3xl border border-black/[0.08] bg-white hover:border-black/20 hover:shadow-lg transition-all space-y-4"
          >
            <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/60 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 font-display">User Navigation</h2>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-900 transition-all" />
              </div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Explore the 3D map, calculate wheelchair-accessible paths, start live GPS turn-by-turn navigation, and report community hazards.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
              <span>Open Accessible Map</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Admin Door */}
          <Link
            href="/admin"
            className="group p-6 rounded-3xl border border-black/[0.08] bg-white hover:border-black/20 hover:shadow-lg transition-all space-y-4"
          >
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 font-display">Admin Panel</h2>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-900 transition-all" />
              </div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Manage venues, author built-environment accessibility audits, run expert rule evaluations, and moderate community reports.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
              <span>Open Admin Workspace</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>

        {/* Feature summary */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium pt-4">
          <span className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-zinc-500" />
            Role-Based Access Control
          </span>
          <span>&bull;</span>
          <span>OpenRouteService GeoJSON</span>
          <span>&bull;</span>
          <span>MapLibre 3D Vector Cartography</span>
          <span>&bull;</span>
          <span>Forward-Chaining Inference Engine</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-zinc-400 pt-6 border-t border-black/[0.04]">
        ACCESSMATE &copy; {new Date().getFullYear()} &bull; Personalized Accessibility Decision-Support Platform
      </footer>
    </div>
  );
}
