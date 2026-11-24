"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  MapPin,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Plus,
  ShieldAlert,
  Cpu,
} from "lucide-react";
import { assessmentRepository } from "@/features/assessment";
import { venuesRepository } from "@/features/venues";
import { reportsRepository } from "@/features/reports";
import { authService } from "@/features/auth";
import type { CommunityReport, ModerationLogEntry } from "@/features/reports/types";
import type { Venue } from "@/features/venues/types";
import type { BuildingAssessmentRecord } from "@/types/assessment";

export default function AdminDashboardPage() {
  const [assessments, setAssessments] = useState<BuildingAssessmentRecord[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLogEntry[]>([]);
  const [userCount, setUserCount] = useState<number>(3);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const [vList, aList, rList] = await Promise.all([
          Promise.resolve(venuesRepository.getVenues()),
          assessmentRepository.getAssessments(),
          reportsRepository.getReports(),
        ]);
        setVenues(vList);
        setAssessments(aList);
        setReports(rList);
        setModerationLogs(reportsRepository.getModerationLogs());
      } catch (e) {
        console.warn("Failed to load dashboard metrics", e);
      }

      fetch("/api/admin/users")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.users) setUserCount(data.users.length);
        })
        .catch(() => {
          setUserCount(authService.getAllUsers().length);
        });

      fetch("/api/admin/activity")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.activity && data.activity.length > 0) {
            const mappedLogs: ModerationLogEntry[] = data.activity.map(
              (act: { id: string; entity_id?: string; admin_id?: string; metadata?: { targetEmail?: string }; action: string; created_at: string }) => ({
                id: act.id,
                reportId: act.entity_id || act.id,
                moderatorId: act.admin_id || "admin",
                moderatorName: act.metadata?.targetEmail ? `Admin (${act.metadata.targetEmail})` : "Administrator",
                previousStatus: "active",
                newStatus: act.action.toLowerCase(),
                note: act.action === "PROVISION_ADMIN" ? "Provisioned platform administrator" : JSON.stringify(act.metadata),
                createdAt: act.created_at,
              })
            );
            setModerationLogs((prev) => {
              const combined = [...mappedLogs, ...prev];
              const seen = new Set<string>();
              return combined.filter((item) => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
              });
            });
          }
        })
        .catch(() => {});
    }

    loadDashboardMetrics();
  }, []);

  const pendingReports = reports.filter((r) => r.moderationStatus === "submitted");
  const underReviewReports = reports.filter((r) => r.moderationStatus === "under_review");
  const verifiedReports = reports.filter((r) => r.moderationStatus === "verified");
  const resolvedReports = reports.filter((r) => r.moderationStatus === "resolved" || r.status === "resolved");

  const statCards = [
    {
      label: "Registered Users",
      value: userCount,
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200/60",
      href: "/admin/users",
    },
    {
      label: "Registered Venues",
      value: venues.length,
      icon: MapPin,
      color: "text-teal-600 bg-teal-50 border-teal-200/60",
      href: "/admin/venues",
    },
    {
      label: "Building Audits",
      value: assessments.length,
      icon: Building2,
      color: "text-blue-600 bg-blue-50 border-blue-200/60",
      href: "/admin/assessments",
    },
    {
      label: "Reports Awaiting Review",
      value: pendingReports.length + underReviewReports.length,
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 border-amber-200/60",
      href: "/admin/reports",
      badge: pendingReports.length > 0 ? `${pendingReports.length} New` : undefined,
    },
    {
      label: "Verified Barriers",
      value: verifiedReports.length,
      icon: FileCheck2,
      color: "text-rose-600 bg-rose-50 border-rose-200/60",
      href: "/admin/reports?status=verified",
    },
    {
      label: "Resolved Incidents",
      value: resolvedReports.length,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
      href: "/admin/reports?status=resolved",
    },
  ];

  return (
    <div className="space-y-7 pb-16">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
            Operational Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time accessibility audits, community report moderation, and venue registry management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/buildings/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Building Audit</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span>Moderate Reports</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${c.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {c.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
                    {c.badge}
                  </span>
                )}
              </div>
              <div>
                <span className="text-2xl font-bold text-zinc-900 font-mono tracking-tight block">
                  {c.value}
                </span>
                <span className="text-[11px] font-medium text-zinc-500 leading-tight block truncate">
                  {c.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Pending Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Reports Awaiting Moderation */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 font-display">
                Pending Community Reports
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono">
                {pendingReports.length + underReviewReports.length} queued
              </span>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>View moderation queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
            {pendingReports.concat(underReviewReports).slice(0, 4).map((report) => (
              <div key={report.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        report.moderationStatus === "under_review"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {report.moderationStatus === "under_review" ? "Under Review" : "Submitted"}
                    </span>
                    <span className="text-xs font-bold text-zinc-900">{report.title}</span>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    <span>{report.location}</span>
                  </p>
                </div>

                <Link
                  href={`/admin/reports?id=${report.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors shrink-0 text-center"
                >
                  Review Submission
                </Link>
              </div>
            ))}

            {pendingReports.length === 0 && underReviewReports.length === 0 && (
              <div className="p-6 text-center text-xs text-zinc-400">
                No reports currently awaiting review. All community submissions are up to date!
              </div>
            )}
          </div>

          {/* Recent Building Audits */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-900 font-display">
                Recent Building Accessibility Audits
              </span>
              <Link
                href="/admin/assessments"
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                <span>All assessments</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
              {assessments.slice(0, 3).map((audit) => (
                <div key={audit.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">{audit.general.name}</h3>
                    <p className="text-[11px] text-zinc-500">{audit.general.address}</p>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">
                      Audited: {audit.general.assessmentDate} &bull; {audit.general.buildingType}
                    </div>
                  </div>

                  <Link
                    href={`/admin/assessments?id=${audit.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                  >
                    View Audit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Shortcuts & Moderation Audit History */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-zinc-900 font-display block">
              Quick Operations
            </span>
            <div className="space-y-2">
              <Link
                href="/admin/buildings/new"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 hover:bg-zinc-50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">New Building Audit</div>
                    <div className="text-[10px] text-zinc-500">Record doorway, ramp &amp; elevator metrics</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>

              <Link
                href="/admin/expert-assessment"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 hover:bg-zinc-50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">Run Expert Inference</div>
                    <div className="text-[10px] text-zinc-500">Cross-reference profile with building audit</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>

              <Link
                href="/admin/venues"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 hover:bg-zinc-50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">Manage Venues</div>
                    <div className="text-[10px] text-zinc-500">Maintain geographic destinations</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Moderation Audit Log */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-zinc-900 font-display block">
              Recent Moderation Activity
            </span>

            {moderationLogs.length > 0 ? (
              <div className="space-y-2.5">
                {moderationLogs.slice(0, 4).map((log, idx) => (
                  <div key={`${log.id}-${idx}`} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 text-[11px]">{log.moderatorName}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-600">
                      Set status to <strong className="uppercase text-zinc-800 font-mono text-[10px]">{log.newStatus}</strong>
                    </div>
                    {log.note && <div className="text-[10px] text-zinc-500 italic">&ldquo;{log.note}&rdquo;</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No moderation actions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
