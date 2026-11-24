"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, ArrowRight, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login({ email, password });
    setIsSubmitting(false);

    if (res.success) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (res.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/map");
      }
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa] p-4 text-[#111110]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-[#111110] text-white flex items-center justify-center shadow-md">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#111110]">
            Sign in to ACCESSMATE
          </h1>
          <p className="text-xs text-zinc-500">
            Personalized accessibility, pedestrian navigation &amp; mobility decision support.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-black/[0.08] bg-white p-7 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.org"
                className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#111110] text-white text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Signing In..." : "Continue"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-black/[0.04] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block text-center">
              Quick Role Selection (Development Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("user@accessmate.org", "User123!")}
                className="p-2.5 rounded-xl border border-black/[0.06] bg-zinc-50 hover:bg-zinc-100 transition-all text-left space-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  <User className="h-3 w-3 text-teal-600" />
                  <span>User Panel</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">user@accessmate.org</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@accessmate.org", "Admin123!")}
                className="p-2.5 rounded-xl border border-black/[0.06] bg-zinc-50 hover:bg-zinc-100 transition-all text-left space-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  <ShieldCheck className="h-3 w-3 text-indigo-600" />
                  <span>Admin Panel</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">admin@accessmate.org</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500">
          New to ACCESSMATE?{" "}
          <Link href="/register" className="font-semibold text-zinc-800 hover:underline">
            Create user account
          </Link>
        </p>
      </div>
    </div>
  );
}
