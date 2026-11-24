"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  Search,
  Check,
  FileText,
  Filter,
} from "lucide-react";
import {
  reportsRepository,
  type CommunityReport,
  type ReportModerationStatus,
  type ModerationLogEntry,
  INITIAL_COMMUNITY_REPORTS,
} from "@/features/reports";
import { useAuth } from "@/features/auth";

export default function AdminReportModerationPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<CommunityReport[]>(() => [...INITIAL_COMMUNITY_REPORTS]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ReportModerationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [moderationNote, setModerationNote] = useState("");
  const [targetStatus, setTargetStatus] = useState<ReportModerationStatus>("verified");
  const [moderationLogs, setModerationLogs] = useState<ModerationLogEntry[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setReports(reportsRepository.getReports());
      setModerationLogs(reportsRepository.getModerationLogs());
    };
    handleUpdate();
    window.addEventListener("accessmate:reports-updated", handleUpdate);
    return () => window.removeEventListener("accessmate:reports-updated", handleUpdate);
  }, []);

  const selectedReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId) ?? null
    : null;

  const handleApplyModeration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const adminId = user?.id ?? "usr-admin-01";
    const adminName = user?.name ?? "Administrator";

    const ok = reportsRepository.moderateReport(
      selectedReport.id,
      adminId,
      adminName,
      targetStatus,
      moderationNote.trim() || undefined
    );

    if (ok) {
      setFeedbackMsg(`Updated status of "${selectedReport.title}" to ${targetStatus.toUpperCase()}.`);
      setModerationNote("");
      setReports(reportsRepository.getReports());
      setModerationLogs(reportsRepository.getModerationLogs());
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const filtered = reports.filter((r) => {
    if (statusFilter !== "all" && r.moderationStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ReportModerationStatus) => {
    switch (status) {
      case "verified":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">Verified Barrier</span>;
      case "under_review":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">Under Review</span>;
      case "rejected":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200">Rejected / False</span>;
      case "resolved":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">Resolved</span>;
      case "submitted":
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200">Submitted</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
            Community Report Moderation
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono">
            Verification Queue
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Review peer-submitted obstacles, verify physical barrier reports, reject spam, and resolve repaired hazards.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-zinc-100 p-0.5 text-xs font-medium overflow-x-auto no-scrollbar">
          {(["all", "submitted", "under_review", "verified", "rejected", "resolved"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-white text-zinc-900 font-semibold shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {s === "all" ? "All Submissions" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Two Column Layout: Feed Table & Moderation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Report Submissions List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
            {filtered.map((report) => {
              const isSelected = selectedReportId === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReportId(report.id);
                    setTargetStatus(report.moderationStatus);
                    setModerationNote(report.moderationNotes ?? "");
                  }}
                  className={`p-4 transition-all cursor-pointer space-y-2 ${
                    isSelected ? "bg-indigo-50/50 ring-1 ring-inset ring-indigo-300" : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.moderationStatus)}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono">
                        {report.category}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {report.timeAgo}
                      </span>
                    </div>

                    <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                      <Users className="h-3 w-3 text-zinc-400" />
                      <strong className="font-mono">{report.confirmationCount}</strong> confirmations
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 font-display">{report.title}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{report.location}</span>
                      <span className="font-mono text-[10px] text-zinc-400 ml-1">
                        ({report.coordinates.latitude.toFixed(4)}, {report.coordinates.longitude.toFixed(4)})
                      </span>
                    </p>
                    <p className="text-xs text-zinc-700 mt-1 line-clamp-2">{report.details}</p>
                  </div>

                  {report.moderationNotes && (
                    <div className="p-2 rounded-lg bg-zinc-100/70 text-[11px] text-zinc-600 font-mono">
                      <strong>Note:</strong> {report.moderationNotes}
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-400">
                No reports matching filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Moderation Action Form */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-900 font-display">
                Moderation Action
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {selectedReport ? selectedReport.id : "Select a report"}
              </span>
            </div>

            {selectedReport ? (
              <form onSubmit={handleApplyModeration} className="space-y-3 text-xs">
                <div>
                  <div className="font-bold text-zinc-900 text-sm leading-tight">
                    {selectedReport.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Reported by: <span className="font-semibold text-zinc-700">{selectedReport.reportedBy || "Community Member"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 block">
                    Set Official Status
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as ReportModerationStatus)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white font-medium"
                  >
                    <option value="verified">Verified (Official Active Barrier)</option>
                    <option value="under_review">Under Review (Investigating)</option>
                    <option value="resolved">Resolved (Obstacle Cleared)</option>
                    <option value="rejected">Rejected (Invalid / Duplicate / Spam)</option>
                    <option value="submitted">Submitted (Pending)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 block">
                    Internal Moderation Note
                  </label>
                  <textarea
                    rows={3}
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    placeholder="e.g. Cross-referenced with city construction schedule; obstacle confirmed."
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Update Moderation Status</span>
                </button>
              </form>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-400">
                Click on any report in the queue to inspect details and assign official verification.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
