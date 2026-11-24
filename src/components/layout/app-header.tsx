"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, User, Navigation, Building2 } from "lucide-react";
import { siteConfig } from "@/config/site";

export interface AppHeaderProps {
  readonly onOpenMobileMenu: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const pathname = usePathname();

  const currentNav = siteConfig.mainNav.find((item) => item.href === pathname);
  const pageTitle = currentNav ? currentNav.title : "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-13 w-full items-center justify-between border-b border-black/[0.05] bg-[#fbfbfa]/80 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          aria-controls="mobile-navigation"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.06] text-zinc-700 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black lg:hidden cursor-pointer"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Minimal Title */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#111110] tracking-tight">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right Header Navigation Quick Links */}
      <div className="flex items-center gap-1.5">
        <Link
          href="/routes"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.03] transition-colors"
        >
          <Navigation className="h-3.5 w-3.5 text-zinc-400" />
          <span>Route Advisor</span>
        </Link>
        <Link
          href="/assessment"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.03] transition-colors"
        >
          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
          <span>Venues</span>
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-800 transition-colors border border-black/[0.06] shadow-2xs"
        >
          <User className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden md:inline">Profile</span>
        </Link>
      </div>
    </header>
  );
}
