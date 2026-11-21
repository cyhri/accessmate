import React from "react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 py-10 mt-auto">
      <Container size="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: System Purpose */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-slate-100">
              {siteConfig.name}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Column 2: Scope Disclaimer (per Blueprint requirements) */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-slate-100">
              Scope & Decision-Support Notice
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ACCESSMATE is an informational decision-support tool. It is not an official legal accessibility certification, a substitute for an on-site professional access audit, or an unconditional safety guarantee. Always verify on-site conditions when traveling.
            </p>
          </div>

          {/* Column 3: Architecture & Phase Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-slate-100">
              Technical Architecture
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Phase:</span> {siteConfig.phase}
              </li>
              <li>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Framework:</span> Next.js (App Router) + TypeScript
              </li>
              <li>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Styling:</span> Tailwind CSS
              </li>
              <li>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Reasoning Engine:</span> Modular Expert System (Phase 4)
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {siteConfig.year} {siteConfig.name}. All rights reserved.</p>
          <p className="text-slate-400 dark:text-slate-500">
            Version {siteConfig.version} · Clean Architecture Baseline
          </p>
        </div>
      </Container>
    </footer>
  );
}
