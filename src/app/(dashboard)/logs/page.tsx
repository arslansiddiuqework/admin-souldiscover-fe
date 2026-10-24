"use client";

import React, { useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";

const CATEGORY_CHIPS = [
  { id: "ALL", label: "All" },
  { id: "AUTH", label: "Auth" },
  { id: "CRISIS", label: "Crisis" },
  { id: "SECURITY", label: "Security" },
  { id: "SYSTEM", label: "System" },
  { id: "ADMIN", label: "Admin" },
] as const;

function severityStyle(sev: string) {
  if (sev === "CRITICAL")
    return {
      pill: "bg-[#B4233D] text-white animate-pulse",
      rail: "bg-[#B4233D]",
    };
  if (sev === "WARNING")
    return { pill: "bg-[#FFF5D9] text-[#946200] border border-[#946200]/30", rail: "bg-[#E0A100]" };
  return { pill: "bg-[#EEF4FF] text-[#315FC2] border border-[#4F7FE8]/30", rail: "bg-[#4F7FE8]" };
}

function categoryStyle(cat: string) {
  if (cat === "AUTH") return "bg-[#EEF4FF] text-[#315FC2]";
  if (cat === "CRISIS") return "bg-[#FFF0F2] text-[#B4233D]";
  if (cat === "SECURITY") return "bg-[#FFF1E9] text-[#C46B4A]";
  if (cat === "SYSTEM") return "bg-[#F0EAFE] text-[#5B3FA8]";
  if (cat === "ADMIN") return "bg-[#FFE5F0] text-[#B74783]";
  return "bg-[#F4F0F8] text-[#795A70]";
}

export default function LogsPage() {
  const [category, setCategory] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [page, setPage] = useState(1);

  const { logs, pagination, isLoading } = useLogs({
    category,
    severity,
    page,
    limit: 15
  });

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const countBy = (sev: string) => logs.filter((l: any) => l.severity === sev).length;

  return (
    <div className="page-shell">
      <PageHeader
        tone="sky"
        eyebrow="Audit trail"
        title="Activity Logs"
        description="History of system activity and emergency alerts."
        meta={
          <>
            <span className="badge badge-sky">
              {pagination?.total ?? 0} total entries
            </span>
            <span className="badge badge-success">
              <span className="material-symbols-outlined text-[12px]">verified_user</span>
              Signed & encrypted
            </span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          tone="sky"
          icon="receipt_long"
          label="Total entries"
          value={pagination?.total ?? 0}
          hint="All matching filters"
          spark={[2, 3, 4, 4, 5, 6, 6, 7]}
        />
        <MetricTile
          tone="sky"
          icon="info"
          label="Info (page)"
          value={countBy("INFO")}
          hint="Routine events"
          spark={[3, 4, 3, 5, 4, 5, 6, 5]}
        />
        <MetricTile
          tone="peach"
          icon="warning"
          label="Warnings (page)"
          value={countBy("WARNING")}
          hint="Needs review"
          spark={[1, 2, 1, 3, 2, 2, 3, 2]}
        />
        <MetricTile
          tone="alert"
          icon="gpp_maybe"
          label="Critical (page)"
          value={countBy("CRITICAL")}
          hint="Immediate attention"
          spark={[0, 1, 0, 1, 2, 1, 2, 1]}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-[22px] border border-[#DCE7FF] bg-white p-4 shadow-card lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <label className="label-eyebrow !text-[#315FC2]">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  category === c.id
                    ? "bg-[#49263D] text-white shadow-sm"
                    : "bg-[#EEF4FF] text-[#315FC2] hover:bg-[#DCE7FF]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 lg:w-56">
          <label className="label-eyebrow !text-[#315FC2]">Severity</label>
          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="field-select text-xs"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Ledger */}
      <div className="overflow-hidden rounded-[22px] border border-[#DCE7FF] bg-white shadow-card">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#49263D] via-[#2F3E7A] to-[#315FC2] px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <div>
              <h2 className="text-sm font-bold">Event Stream</h2>
              <p className="text-[11px] text-white/65">
                Filtered activity with severity markers
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#86EFAC]" />
            Ledger
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#DCE7FF] bg-[#F5F8FF]">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#315FC2]">Timestamp</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#315FC2]">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#315FC2]">Description</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#315FC2]">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF4FF] text-[11px] text-on-surface-variant">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-3.5">
                      <div className="skeleton h-3.5 w-28" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="skeleton h-3.5 w-14" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="skeleton h-3.5 w-80" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="skeleton ml-auto h-3.5 w-12" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#4F7FE8] ring-1 ring-[#DCE7FF]">
                        <span className="material-symbols-outlined text-[28px]">description</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No logs found</p>
                      <p className="text-xs text-on-surface-muted">
                        Try adjusting category or severity filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => {
                  const sev = severityStyle(log.severity);
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-[#F5F8FF]">
                      <td className="relative whitespace-nowrap px-5 py-3.5">
                        <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${sev.rail}`} />
                        <div className="font-mono text-[#49263D]">{log.timestamp}</div>
                        <div className="mt-0.5 font-sans text-[10px] font-medium text-[#4F7FE8]">
                          {timeAgo(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 font-sans text-[9px] font-bold uppercase tracking-wider ${categoryStyle(
                            log.category
                          )}`}
                        >
                          {log.category === "AUTH"
                            ? "Auth"
                            : log.category === "CRISIS"
                            ? "Crisis"
                            : log.category}
                        </span>
                      </td>
                      <td
                        className="max-w-lg truncate px-4 py-3.5 font-sans leading-relaxed text-[#49263D]"
                        title={log.description}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#49263D] text-[9px] font-bold text-white">
                            {log.userProfileImage ? (
                              <AvatarImage
                                src={log.userProfileImage}
                                alt="User"
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "U"
                            )}
                          </div>
                          <span className="truncate">{log.description}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${sev.pill}`}
                        >
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && logs.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#DCE7FF] bg-[#F5F8FF] px-5 py-3.5 font-sans text-xs sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[#795A70]">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="soft-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="soft-btn-sky"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic integrity footer */}
      <div className="flex flex-col gap-3 rounded-[22px] bg-[#49263D] px-5 py-4 font-sans text-[11px] text-white shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="text-white/70">
          Log Security:{" "}
          <span className="font-mono font-semibold text-white">Signed & Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#86EFAC]">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Logs Saved Securely
          </span>
        </div>
      </div>
    </div>
  );
}
