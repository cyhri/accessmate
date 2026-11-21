import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-md py-1 px-1.5"
              aria-label={`${siteConfig.name} Home`}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-lg shadow-xs"
                aria-hidden="true"
              >
                A
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 text-base leading-tight">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 leading-none">
                  Decision-Support System
                </span>
              </div>
            </Link>

            <Badge variant="teal" className="hidden sm:inline-flex ml-2">
              Phase 4 Active
            </Badge>
          </div>

          {/* Navigation Structure */}
          <nav aria-label="Main Navigation">
            <ul className="flex items-center gap-1 sm:gap-2">
              {siteConfig.mainNav.map((item) => {
                const isReady = item.status === "ready";
                return (
                  <li key={item.href}>
                    {isReady ? (
                      <Link
                        href={item.href}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-slate-700 hover:text-teal-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-slate-400 cursor-not-allowed select-none"
                        title={`${item.title} — Scheduled for ${item.phase}`}
                        aria-disabled="true"
                      >
                        {item.title}
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.phase}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}
