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
    <div className="min-h-screen bg-[#fbfbfa] text-[#111110] flex flex-col antialiased">
      <SkipLink targetId="main-content" />

      {/* Desktop Fixed Left Sidebar - Narrower & Quieter (230px) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[230px]">
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
            className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-[#fbfbfa] shadow-2xl">
            {/* Close Button Header */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-black/[0.05]">
              <span className="text-xs font-semibold text-zinc-700">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
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
      <div className="flex flex-1 flex-col lg:pl-[230px]">
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none p-4 sm:p-6 lg:p-7">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
