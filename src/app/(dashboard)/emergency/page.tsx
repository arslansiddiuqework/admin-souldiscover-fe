"use client";

import React from "react";
import { useEmergency } from "@/hooks/useEmergency";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmergencyPage() {
  const { status, logs, contacts, isLoading } = useEmergency();

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

  if (isLoading) {
    return (
      <div className="page-shell animate-pulse">
        <div className="h-36 rounded-[28px] border border-border bg-white/70" />
        <div className="h-24 rounded-[22px] border border-border bg-white/70" />
        <div className="h-64 rounded-[22px] border border-border bg-white/70" />
      </div>
    );
  }

  const isEmergencyActive = status?.system?.crisisEnabled ?? false;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Safety Operations"
        title="Emergency Control Panel"
        description="Monitor system-level emergency response behavior. (Read Only)"
        meta={
          <>
            <span className={`badge ${isEmergencyActive ? "badge-primary" : "badge-error"}`}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isEmergencyActive ? "bg-primary animate-pulse" : "bg-error"
                }`}
              />
              {isEmergencyActive ? "Crisis system enabled" : "Crisis system disabled"}
            </span>
            <span className="badge badge-neutral">{logs.length} recent events</span>
          </>
        }
      />

      {/* Status Card — urgent but restrained */}
      <div
        className={`panel relative overflow-hidden ${
          isEmergencyActive
            ? "border-primary/20"
            : "border-error/25"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${
            isEmergencyActive
              ? "from-[#FFF0F6]/90 via-white to-white"
              : "from-[#FFF0F2]/90 via-white to-white"
          }`}
        />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                isEmergencyActive
                  ? "bg-[#FFE5F0] text-primary"
                  : "bg-error-container text-error"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isEmergencyActive ? "health_and_safety" : "warning"}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">System Status</p>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                Emergency response system is currently{" "}
                <span
                  className={`font-semibold ${
                    isEmergencyActive ? "text-primary" : "text-error"
                  }`}
                >
                  {isEmergencyActive ? "Enabled" : "Disabled"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`badge ${
                isEmergencyActive ? "badge-primary" : "badge-error"
              }`}
            >
              {isEmergencyActive ? "Active" : "Inactive"}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                isEmergencyActive ? "bg-primary animate-pulse" : "bg-error"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Emergency Events Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">emergency</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Emergency Events</h2>
              <p className="text-[11px] text-on-surface-muted">Crisis escalations and call outcomes</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell">User</th>
                <th className="table-head-cell">Reason</th>
                <th className="table-head-cell">Contact</th>
                <th className="table-head-cell">Time</th>
                <th className="table-head-cell">Details</th>
                <th className="table-head-cell text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined text-[28px]">emergency</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No emergency events</p>
                      <p className="text-xs text-on-surface-muted">
                        Crisis escalations will appear here when triggered.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[#FFF0F6] text-xs font-semibold text-primary shadow-xs">
                          {log.userProfileImage ? (
                            <AvatarImage
                              src={log.userProfileImage}
                              alt={log.userName}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (log.userName || "Unknown").charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-xs font-semibold text-on-surface">
                          {log.userName}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-xs text-on-surface-variant">
                      {log.escalationReason || log.riskLevel}
                    </td>
                    <td className="table-cell space-y-1 text-xs text-on-surface-variant">
                      <div className="font-medium text-on-surface">{log.contactCalled}</div>
                      {log.contactPhone && (
                        <div className="text-[10px] text-on-surface-muted">
                          {log.contactPhone}
                        </div>
                      )}
                      {log.contactWhatsApp && (
                        <div className="text-[10px] text-success">{log.contactWhatsApp}</div>
                      )}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="text-xs text-on-surface-variant">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-0.5 font-sans text-[10px] font-medium text-on-surface-muted">
                        {timeAgo(log.createdAt)}
                      </div>
                    </td>
                    <td className="table-cell space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
                          Risk Score:
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            log.crisisRiskScore >= 0.9
                              ? "text-error"
                              : log.crisisRiskScore >= 0.75
                              ? "text-warning"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {log.crisisRiskScore != null
                            ? `${Math.round(log.crisisRiskScore * 100)}%`
                            : "—"}
                        </span>
                      </div>
                      {log.duration != null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wide text-on-surface-muted">
                            Duration:
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {log.duration}s
                          </span>
                        </div>
                      )}
                      {log.callSid && (
                        <div
                          className="max-w-[160px] truncate font-mono text-[10px] text-on-surface-muted"
                          title={log.callSid}
                        >
                          SID: {log.callSid}
                        </div>
                      )}
                      {(log.error || log.twilioErrorCode) && (
                        <div className="max-w-[220px] text-[10px] leading-snug text-error">
                          {log.error}
                          {log.twilioErrorCode && (
                            <span className="ml-1 opacity-70">({log.twilioErrorCode})</span>
                          )}
                        </div>
                      )}
                      {!log.duration &&
                        !log.callSid &&
                        !log.error &&
                        !log.twilioErrorCode &&
                        log.crisisRiskScore == null && (
                          <span className="text-[10px] text-on-surface-muted">—</span>
                        )}
                    </td>
                    <td className="table-cell text-right">
                      <span
                        className={`badge uppercase tracking-wider text-[10px] ${
                          log.outcome === "completed" ? "badge-success" : "badge-error"
                        }`}
                      >
                        {log.callStatus || log.outcome}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users with emergency contacts */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">contacts</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Users With Emergency Contacts
              </h2>
              <p className="text-[11px] text-on-surface-muted">Consent and auto-call readiness</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell">User</th>
                <th className="table-head-cell">Consent</th>
                <th className="table-head-cell">Contacts</th>
                <th className="table-head-cell">Auto-call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!Array.isArray(contacts) || contacts.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <span className="material-symbols-outlined text-[28px]">contact_phone</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">
                        No emergency contact records
                      </p>
                      <p className="text-xs text-on-surface-muted">
                        Records will appear once users add emergency contacts.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.slice(0, 25).map((record: any, idx: number) => (
                  <tr key={idx} className="table-row">
                    <td className="table-cell text-xs">
                      <div className="font-semibold text-on-surface">
                        {record.userId?.name || "Unknown"}
                      </div>
                      <div className="text-[10px] text-on-surface-muted">
                        {record.userId?.email || ""}
                      </div>
                    </td>
                    <td className="table-cell text-xs">
                      {record.consentAccepted ? (
                        <span className="badge badge-success text-[10px]">Accepted</span>
                      ) : (
                        <span className="badge badge-neutral text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="table-cell text-xs">
                      {record.contactCount ?? record.contacts?.length ?? 0}
                      <div className="mt-1 text-[10px] text-on-surface-muted">
                        {(record.contacts || [])
                          .slice(0, 2)
                          .map((c: any) => c.name)
                          .join(", ")}
                      </div>
                    </td>
                    <td className="table-cell text-xs">
                      {record.escalationSettings?.autoCall ? (
                        <span className="badge badge-primary text-[10px]">Enabled</span>
                      ) : (
                        <span className="badge badge-neutral text-[10px]">Off</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communication Status */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">cell_tower</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Communication System</h3>
              <p className="text-[11px] text-on-surface-muted">Twilio voice & WhatsApp readiness</p>
            </div>
          </div>
        </div>

        <div className="space-y-0 divide-y divide-border px-5 py-1">
          <div className="flex items-center justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">Twilio Configured</span>
            <span
              className={`badge text-[10px] ${
                status?.system?.twilioConfigured ? "badge-success" : "badge-error"
              }`}
            >
              {status?.system?.twilioConfigured ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">Emergency Number (Voice)</span>
            <span className="font-mono text-on-surface">
              {status?.system?.twilioPhone || "Not Configured"}
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">WhatsApp Number</span>
            <span className="font-mono text-on-surface">
              {status?.system?.twilioWhatsApp || "Not Configured"}
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5 text-xs">
            <span className="text-on-surface-variant">Max Escalations / Day</span>
            <span className="font-semibold text-primary">{status?.system?.maxPerDay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
