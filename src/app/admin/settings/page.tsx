"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Server,
  Layers,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Key,
  Info,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemoData = () => {
    if (!window.confirm("Are you sure you want to reset demo data and clear browser storage caches?")) {
      return;
    }
    setResetting(true);
    try {
      localStorage.removeItem("accessmate_community_reports");
      localStorage.removeItem("accessmate_moderation_logs");
      localStorage.removeItem("accessmate_venues");
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Platform Diagnostics & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Infrastructure health, mapping configurations, PostgreSQL database state, and administrative operations.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl text-sm flex items-center gap-3 bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Local test cache cleared. Refreshing platform state...</span>
        </div>
      )}

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vector Tile Server */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Vector Tile Service</h3>
                <p className="text-xs text-slate-500">OpenFreeMap (OpenMapTiles Schema)</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1 font-mono">
            <div>Style URL: https://tiles.openfreemap.org/styles/liberty</div>
            <div>3D Extrusions: Source-layer building (height & min_height)</div>
          </div>
        </div>

        {/* Routing Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Routing Provider</h3>
                <p className="text-xs text-slate-500">OpenRouteService API</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1 font-mono">
            <div>Profiles: wheelchair, foot-walking</div>
            <div>Directional Buffer: 35m corridor / 0.2 dot product</div>
          </div>
        </div>

        {/* Database & RLS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Database & Persistence</h3>
                <p className="text-xs text-slate-500">PostgreSQL (Supabase) + Local Hybrid</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              RLS Enabled
            </span>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1 font-mono">
            <div>Schema: supabase/migrations/20261124_accessmate_core.sql</div>
            <div>Policies: Anonymous read, authenticated submit, admin moderate</div>
          </div>
        </div>

        {/* Authentication & RBAC */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Session & Auth Engine</h3>
                <p className="text-xs text-slate-500">HTTP-Only Cookie + Signed JWT</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Enforced
            </span>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1 font-mono">
            <div>Current Admin: {user?.email}</div>
            <div>RBAC Middleware: /admin/*, /api/admin/*</div>
          </div>
        </div>
      </div>

      {/* Environment Configuration Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Key className="w-5 h-5 text-slate-700" />
          Environment Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Set these variables in your deployment settings (e.g., Vercel, Supabase, or `.env.local`).
        </p>
        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-2">
          <p className="text-emerald-400 font-bold"># OpenRouteService Pedestrian Routing</p>
          <p>NEXT_PUBLIC_ORS_API_KEY=&quot;5b3ce3597851110001cf6248...&quot;</p>
          <p className="text-emerald-400 font-bold mt-2"># Supabase Production Database</p>
          <p>NEXT_PUBLIC_SUPABASE_URL=&quot;https://your-project.supabase.co&quot;</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=&quot;eyJhbGciOi...&quot;</p>
          <p className="text-emerald-400 font-bold mt-2"># Session Secret for Signed Auth Tokens</p>
          <p>ACCESSMATE_AUTH_SECRET=&quot;production-secret-min-32-chars&quot;</p>
        </div>
      </div>

      {/* Administrative Operations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-slate-700" />
          Cache & Test Data Reset
        </h2>
        <p className="text-xs text-slate-500">
          Clear local storage repositories (community reports, venues, moderation audits) to restore default initial state.
        </p>
        <div>
          <button
            type="button"
            disabled={resetting}
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting..." : "Reset Local Demo Storage"}
          </button>
        </div>
      </div>

      {/* Helpful Links */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <span>Accessmate Core 2.0 • Build ID: 2026.11-rc1</span>
        </div>
        <a
          href="/map"
          className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
        >
          Open User Map View <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
