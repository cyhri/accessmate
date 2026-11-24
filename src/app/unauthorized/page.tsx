"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa] p-4 text-[#111110]">
      <div className="max-w-md w-full rounded-3xl border border-black/[0.08] bg-white p-8 shadow-xl text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-inner border border-amber-200/60">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Access Restricted
          </span>
          <h1 className="text-xl font-bold font-display text-[#111110]">
            Administrator Privileges Required
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your current account has the standard <strong className="text-zinc-700">user</strong> role. Access to the Admin Panel, building audit authoring, and report moderation is restricted to provisioned administrators.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 border border-black/[0.04] text-[11px] text-zinc-600 text-left space-y-1">
          <div className="font-semibold text-zinc-800">Need admin access?</div>
          <div>Sign in with the provisioned administrator credential:</div>
          <code className="block font-mono bg-white p-1.5 rounded-lg border border-black/[0.06] text-[10px] text-zinc-700">
            admin@accessmate.org / Admin123!
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link
            href="/map"
            className="flex-1 py-2.5 px-4 rounded-xl border border-black/[0.08] text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Map</span>
          </Link>
          <Link
            href="/login?redirect=/admin"
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#111110] text-white text-xs font-semibold hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Switch Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
