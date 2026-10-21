"use client";

import React, { useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

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

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Audit Trail"
        title="Activity Logs"
        description="History of system activity and emergency alerts."
        meta={
          <>
            <span className="badge badge-neutral">
              {pagination?.total ?? 0} total entries
            </span>
            <span className="badge badge-primary">Signed & encrypted</span>
          </>
        }
      />

      {/* Filters */}
      <div className="filter-bar !grid-cols-1 sm:!grid-cols-2">
        <div className="space-y-1.5">
          <label className="label-eyebrow">Category</label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="field-select text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTH">Login & Auth</option>
            <option value="CRISIS">Emergency Alerts</option>
            <option value="SECURITY">Security Warnings</option>
            <option value="SYSTEM">Settings Changes</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="label-eyebrow">Severity</label>
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

      {/* Logs Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Event Stream</h2>
              <p className="text-[11px] text-on-surface-muted">
                Filtered activity with severity markers
              </p>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell">Timestamp</th>
                <th className="table-head-cell">Category</th>
                <th className="table-head-cell">Description</th>
                <th className="table-head-cell text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[11px] text-on-surface-variant">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="table-cell">
                      <div className="skeleton h-3.5 w-28" />
                    </td>
                    <td className="table-cell">
                      <div className="skeleton h-3.5 w-14" />
                    </td>
                    <td className="table-cell">
                      <div className="skeleton h-3.5 w-80" />
                    </td>
                    <td className="table-cell text-right">
                      <div className="skeleton ml-auto h-3.5 w-12" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
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
                logs.map((log: any) => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell whitespace-nowrap">
                      <div className="font-mono text-on-surface-variant">{log.timestamp}</div>
                      <div className="mt-0.5 font-sans text-[10px] font-medium text-on-surface-muted">
                        {timeAgo(log.timestamp)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-neutral font-sans text-[9px]">
                        {log.category === "AUTH"
                          ? "Auth"
                          : log.category === "CRISIS"
                          ? "Crisis"
                          : log.category}
                      </span>
                    </td>
                    <td
                      className="table-cell max-w-lg truncate font-sans leading-relaxed text-on-surface"
                      title={log.description}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[#FFF0F6] text-[9px] font-semibold text-primary shadow-xs">
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
                    <td className="table-cell text-right font-sans">
                      <span
                        className={`badge text-[9px] ${
                          log.severity === "CRITICAL"
                            ? "badge-error animate-pulse"
                            : log.severity === "WARNING"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && logs.length > 0 && (
          <div className="pagination-bar font-sans text-xs">
            <span className="text-on-surface-variant">
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
                className="soft-btn"
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
      <div className="panel">
        <div className="flex flex-col gap-3 px-5 py-4 font-sans text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <div className="text-on-surface-variant">
            Log Security:{" "}
            <span className="font-mono font-medium text-on-surface">Signed & Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider">
              Logs Saved Securely
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
