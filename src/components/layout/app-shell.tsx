"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";
import { SkipLink } from "@/components/ui/skip-link";
import { X } from "lucide-react";
import { Footer } from "./footer";

export interface AppShellProps {
  readonly children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <SkipLink targetId="main-content" />

      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 xl:w-72">
        <Sidebar className="w-full" />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          id="mobile-navigation"
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-slate-900 shadow-2xl">
            {/* Close Button Header */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                ACCESSMATE Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Sidebar inside Drawer */}
            <Sidebar
              onNavigate={() => setMobileMenuOpen(false)}
              className="w-full flex-1 border-r-0"
            />
          </div>
        </div>
      )}

      {/* Main Content Area Offset for Desktop Sidebar */}
      <div className="flex flex-1 flex-col lg:pl-64 xl:pl-72">
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
