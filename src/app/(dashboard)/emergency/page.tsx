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
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-surface rounded-lg" />
        <div className="h-40 bg-surface rounded-xl" />
        <div className="h-64 bg-surface rounded-xl" />
      </div>
    );
  }

  const isEmergencyActive = status?.system?.crisisEnabled ?? false;

  return (
    <div className="flex flex-col gap-4 text-on-surface font-sans">
      <PageHeader
        title="Emergency Control Panel"
        description="Monitor system-level emergency response behavior. (Read Only)"
      />

      {/* Status Card */}
      <div className="card p-5 flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-on-surface">
            System Status
          </p>
          <p className="text-xs text-on-surface-variant/70 mt-1 font-normal">
            Emergency response system is currently{" "}
            <span className={`font-semibold ${isEmergencyActive ? "text-primary" : "text-error"}`}>
              {isEmergencyActive ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant/80 font-medium">
            {isEmergencyActive ? "Active" : "Inactive"}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${isEmergencyActive ? "bg-primary animate-pulse" : "bg-error"}`}
          />
        </div>
      </div>

      {/* Emergency Events Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-on-surface">
            Emergency Events
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell px-6">User</th>
                <th className="table-head-cell px-6">Reason</th>
                <th className="table-head-cell px-6">Contact</th>
                <th className="table-head-cell px-6">Time</th>
                <th className="table-head-cell px-6">Details</th>
                <th className="table-head-cell px-6 text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#FFF0F6]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-dim border border-outline-variant flex items-center justify-center font-semibold text-xs text-primary shadow-sm overflow-hidden flex-shrink-0">
                        {log.userProfileImage ? (
                          <AvatarImage src={log.userProfileImage} alt={log.userName} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          (log.userName || "Unknown").charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-xs font-semibold text-on-surface">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant/80">
                    {log.escalationReason || log.riskLevel}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant/60 space-y-1">
                    <div className="font-medium text-on-surface">{log.contactCalled}</div>
                    {log.contactPhone && <div className="text-[10px] text-on-surface-variant/80">📞 {log.contactPhone}</div>}
                    {log.contactWhatsApp && <div className="text-[10px] text-green-500">💬 {log.contactWhatsApp}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-on-surface-variant/95">{new Date(log.createdAt).toLocaleString()}</div>
                    <div className="text-[10px] text-on-surface-muted font-sans font-medium mt-0.5">{timeAgo(log.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    {/* Risk Score */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-wide">Risk Score:</span>
                      <span className={`text-xs font-semibold ${
                        log.crisisRiskScore >= 0.9 ? "text-error" :
                        log.crisisRiskScore >= 0.75 ? "text-warning" :
                        "text-on-surface-variant"
                      }`}>
                        {log.crisisRiskScore != null
                          ? `${Math.round(log.crisisRiskScore * 100)}%`
                          : "—"}
                      </span>
                    </div>
                    {/* Call Duration (only if completed) */}
                    {log.duration != null && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-wide">Duration:</span>
                        <span className="text-xs text-on-surface-variant">{log.duration}s</span>
                      </div>
                    )}
                    {/* Call SID */}
                    {log.callSid && (
                      <div className="text-[10px] text-on-surface-variant/50 font-mono truncate max-w-[160px]" title={log.callSid}>
                        SID: {log.callSid}
                      </div>
                    )}
                    {/* Twilio Error */}
                    {(log.error || log.twilioErrorCode) && (
                      <div className="text-[10px] text-error leading-snug max-w-[220px]">
                        {log.error}
                        {log.twilioErrorCode && (
                          <span className="ml-1 opacity-70">({log.twilioErrorCode})</span>
                        )}
                      </div>
                    )}
                    {/* No info at all */}
                    {!log.duration && !log.callSid && !log.error && !log.twilioErrorCode && log.crisisRiskScore == null && (
                      <span className="text-[10px] text-on-surface-variant/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`badge uppercase tracking-wider text-[10px] ${
                        log.outcome === "completed" ? "badge-success" : "badge-error"
                      }`}
                    >
                      {log.callStatus || log.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users with emergency contacts */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-on-surface">
            Users With Emergency Contacts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="admin-table-head">
              <tr>
                <th className="table-head-cell px-6">User</th>
                <th className="table-head-cell px-6">Consent</th>
                <th className="table-head-cell px-6">Contacts</th>
                <th className="table-head-cell px-6">Auto-call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!Array.isArray(contacts) || contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-xs text-on-surface-variant/70 text-center">
                    No emergency contact records yet.
                  </td>
                </tr>
              ) : (
                contacts.slice(0, 25).map((record: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#FFF0F6]">
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold">
                        {record.userId?.name || "Unknown"}
                      </div>
                      <div className="text-[10px] text-on-surface-variant/70">
                        {record.userId?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {record.consentAccepted ? (
                        <span className="badge badge-success text-[10px]">Accepted</span>
                      ) : (
                        <span className="badge badge-neutral text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {record.contactCount ?? record.contacts?.length ?? 0}
                      <div className="text-[10px] text-on-surface-variant/70 mt-1">
                        {(record.contacts || [])
                          .slice(0, 2)
                          .map((c: any) => c.name)
                          .join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {record.escalationSettings?.autoCall ? "Enabled" : "Off"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communication Status */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4 text-on-surface">
          Communication System
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-on-surface-variant/70 font-normal">
              Twilio Configured
            </span>
            <span className={status?.system?.twilioConfigured ? "text-primary font-semibold" : "text-error font-semibold"}>
              {status?.system?.twilioConfigured ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-on-surface-variant/70 font-normal">
              Emergency Number (Voice)
            </span>
            <span className="text-on-surface font-mono">
              {status?.system?.twilioPhone || "Not Configured"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-on-surface-variant/70 font-normal">
              WhatsApp Number
            </span>
            <span className="text-on-surface font-mono">
              {status?.system?.twilioWhatsApp || "Not Configured"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-on-surface-variant/70 font-normal">
              Max Escalations / Day
            </span>
            <span className="text-primary font-semibold">
              {status?.system?.maxPerDay}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}