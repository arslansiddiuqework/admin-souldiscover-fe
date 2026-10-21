"use client";

import React, { useState } from "react";
import { useLogs } from "@/hooks/useLogs";
import { Button } from "@/components/ui/Button";
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
    <div className="flex-1 flex flex-col gap-4 w-full font-sans text-on-surface">
      <PageHeader
        title="Activity Logs"
        description="History of system activity and emergency alerts."
      />

      {/* Filters HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 card p-4">
        <div className="space-y-1">
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

        <div className="space-y-1">
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
      <div className="card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
          <thead className="admin-table-head">
            <tr>
              <th className="table-head-cell px-6">Timestamp</th>
              <th className="table-head-cell px-6">Category</th>
              <th className="table-head-cell px-6">Description</th>
              <th className="table-head-cell px-6 text-right">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-[11px] text-on-surface-variant/85">
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-3.5 bg-surface-dim rounded w-28"></div></td>
                  <td className="px-6 py-4"><div className="h-3.5 bg-surface-dim rounded w-14"></div></td>
                  <td className="px-6 py-4"><div className="h-3.5 bg-surface-dim rounded w-80"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-3.5 bg-surface-dim rounded w-12 ml-auto"></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs text-on-surface-variant/80">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">description</span>
                  <p className="font-semibold text-on-surface">No logs found</p>
                </td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-[#FFF0F6] transition-colors">
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="text-on-surface-variant/90 font-mono">{log.timestamp}</div>
                    <div className="text-[10px] text-on-surface-muted font-sans font-medium mt-0.5">{timeAgo(log.timestamp)}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="badge badge-neutral text-[9px] font-sans">
                      {log.category === "AUTH" ? "Auth" : log.category === "CRISIS" ? "Crisis" : log.category}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-on-surface font-sans leading-relaxed max-w-lg truncate" title={log.description}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-dim border border-outline-variant flex items-center justify-center font-semibold text-[9px] text-primary shadow-sm overflow-hidden flex-shrink-0">
                        {log.userProfileImage ? (
                          <AvatarImage src={log.userProfileImage} alt="User" width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          "U"
                        )}
                      </div>
                      <span className="truncate">{log.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right font-sans">
                    <span className={`badge text-[9px] ${
                      log.severity === "CRITICAL"
                        ? "badge-error animate-pulse"
                        : log.severity === "WARNING"
                        ? "badge-warning"
                        : "badge-info"
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Pagination component */}
        {!isLoading && logs.length > 0 && (
          <div className="px-6 py-4 bg-surface-dim/50 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-sans text-xs">
            <span className="text-on-surface-variant/80">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic integrity footer */}
      <div className="p-4 card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-sans text-[11px]">
        <div className="text-on-surface-variant/80">
          Log Security: <span className="font-mono text-on-surface font-normal">Signed & Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span className="font-semibold uppercase tracking-wider text-[9px]">Logs Saved Securely</span>
        </div>
      </div>
    </div>
  );
}
