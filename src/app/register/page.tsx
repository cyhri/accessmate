"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await register({ email, name, password });
    setIsSubmitting(false);

    if (res.success) {
      router.push("/map");
    } else {
      setError(res.error || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa] p-4 text-[#111110]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-[#111110] text-white flex items-center justify-center shadow-md">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#111110]">
            Create ACCESSMATE Account
          </h1>
          <p className="text-xs text-zinc-500">
            Join the community to plan accessible routes and report mobility hazards.
          </p>
        </div>

        <div className="rounded-3xl border border-black/[0.08] bg-white p-7 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>

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
              <label className="text-[11px] font-semibold text-zinc-700 block">
                Create Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/60 text-[11px] text-teal-800">
              Note: New accounts are automatically assigned standard <strong className="font-semibold">user</strong> privileges with full access to accessible mapping and hazard reporting.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#111110] text-white text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-zinc-800 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
