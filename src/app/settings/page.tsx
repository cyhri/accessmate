"use client";

import React, { useState } from "react";
import { Eye, Info, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useReducedMotion } from "@/hooks/use-media-query";
import { siteConfig } from "@/config/site";

export default function SettingsPage() {
  const isReducedMotion = useReducedMotion();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    try {
      localStorage.clear();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch {
      // Ignore if localStorage unavailable
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <SectionHeading
        title="Settings &amp; Accessibility Preferences"
        description="Configure display contrast, review system diagnostic information, and manage client-side preferences."
        badge={
          <Badge variant="teal" size="md">
            Phase 2 Active
          </Badge>
        }
      />

      {resetSuccess && (
        <Alert variant="success">
          <AlertTitle>Preferences Reset</AlertTitle>
          <AlertDescription>
            Client preferences and local state cache have been reset to factory defaults.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Display & Accessibility */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700 mb-1">
              <Eye className="h-4 w-4" aria-hidden="true" />
              <CardTitle>Display &amp; Contrast</CardTitle>
            </div>
            <CardDescription>
              Accessibility styling guidelines and automated environmental detections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800">WCAG Contrast Standard</span>
                <p className="text-xs text-slate-500">Adheres to WCAG 2.2 Level AA (&ge; 4.5:1 ratio)</p>
              </div>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800">High-Contrast Focus Indicators</span>
                <p className="text-xs text-slate-500">2px visible teal ring on all interactive elements</p>
              </div>
              <Badge variant="success" size="sm">
                Enforced
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800">System Reduced Motion</span>
                <p className="text-xs text-slate-500">Detects OS preference: prefers-reduced-motion</p>
              </div>
              <Badge variant={isReducedMotion ? "teal" : "neutral"} size="sm">
                {isReducedMotion ? "Enabled (OS)" : "Standard Motion"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: System Diagnostic & Metadata */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700 mb-1">
              <Info className="h-4 w-4" aria-hidden="true" />
              <CardTitle>System Diagnostics</CardTitle>
            </div>
            <CardDescription>
              Build version, execution environment, and technical architecture specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs">
              <span className="text-slate-500">Application Name:</span>
              <span className="font-semibold text-slate-800">{siteConfig.name}</span>

              <span className="text-slate-500">Release Version:</span>
              <span className="font-semibold text-slate-800">v{siteConfig.version}</span>

              <span className="text-slate-500">Active Phase:</span>
              <span className="font-semibold text-slate-800">Phase 2: UI Shell</span>

              <span className="text-slate-500">Next.js Framework:</span>
              <span className="font-semibold text-slate-800">v16 (App Router)</span>

              <span className="text-slate-500">React Core:</span>
              <span className="font-semibold text-slate-800">v19</span>

              <span className="text-slate-500">CSS Architecture:</span>
              <span className="font-semibold text-slate-800">Tailwind CSS 4</span>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Operating in client-side decision-support mode. No external telemetry, tracking cookies, or
                private data is collected.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Reset Local Preferences
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
