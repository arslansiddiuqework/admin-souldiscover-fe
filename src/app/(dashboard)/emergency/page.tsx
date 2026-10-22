"use client";

import React from "react";
import { useEmergency } from "@/hooks/useEmergency";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";

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
        <div className="h-40 rounded-[28px] bg-[#401B36]/20" />
        <div className="h-24 rounded-[22px] border border-border bg-white/70" />
        <div className="h-64 rounded-[22px] border border-border bg-white/70" />
      </div>
    );
  }

  const isEmergencyActive = status?.system?.crisisEnabled ?? false;
  const contactList = Array.isArray(contacts) ? contacts : [];
  const failedCalls = logs.filter((l: any) => l.outcome !== "completed").length;
  const highRisk = logs.filter((l: any) => (l.crisisRiskScore ?? 0) >= 0.9).length;

  return (
    <div className="page-shell">
      <PageHeader
        tone="plum"
        eyebrow="Safety operations · Crisis console"
        title="Emergency Control Panel"
        description="Monitor system-level emergency response behavior. (Read Only)"
        meta={
          <>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
                isEmergencyActive
                  ? "border-[#86EFAC]/40 bg-[#287D58]/30 text-[#C9F7DC]"
                  : "border-[#FDA4AF]/50 bg-[#B4233D]/40 text-[#FFE0E5]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isEmergencyActive ? "animate-pulse bg-[#86EFAC]" : "animate-pulse bg-[#FDA4AF]"
                }`}
              />
              {isEmergencyActive ? "Crisis system enabled" : "Crisis system disabled"}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
              {logs.length} recent events
            </span>
          </>
        }
        aside={
          <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center lg:mx-0 lg:h-32 lg:w-32">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-white/10"
            />
            <span
              aria-hidden
              className="absolute inset-3 rounded-full border border-white/15"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#B4233D] to-[#7C1D3A] text-white shadow-[0_0_40px_rgba(180,35,61,0.55)] ring-2 ring-white/30">
              <span className="material-symbols-outlined text-[36px]">emergency</span>
            </div>
          </div>
        }
      />

      {/* Status banner — high contrast */}
      <div
        className={`relative overflow-hidden rounded-[22px] border-2 p-5 shadow-card ${
          isEmergencyActive
            ? "border-[#287D58] bg-[#0F2A20] text-white"
            : "border-[#B4233D] bg-[#2B0F18] text-white"
        }`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${
            isEmergencyActive ? "bg-[#287D58]/50" : "bg-[#B4233D]/60"
          }`}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                isEmergencyActive ? "bg-[#287D58] text-white" : "bg-[#B4233D] text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isEmergencyActive ? "health_and_safety" : "warning"}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                System status
              </p>
              <p className="mt-1 text-base font-bold">
                Emergency response system is currently{" "}
                <span className={isEmergencyActive ? "text-[#86EFAC]" : "text-[#FDA4AF]"}>
                  {isEmergencyActive ? "Enabled" : "Disabled"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-white/65">
                {isEmergencyActive
                  ? "Escalations will trigger outbound contact flows."
                  : "Escalations will NOT trigger outbound contact flows."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                isEmergencyActive ? "bg-[#287D58] text-white" : "bg-[#B4233D] text-white"
              }`}
            >
              {isEmergencyActive ? "Active" : "Inactive"}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isEmergencyActive ? "animate-pulse bg-[#86EFAC]" : "animate-pulse bg-[#FDA4AF]"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          tone="alert"
          icon="emergency"
          label="Recent events"
          value={logs.length}
          hint="Escalation log"
          spark={[1, 2, 2, 3, 5, 4, 6, 7]}
        />
        <MetricTile
          tone="alert"
          icon="priority_high"
          label="High risk"
          value={highRisk}
          hint="Score ≥ 90%"
          spark={[1, 1, 2, 2, 3, 3, 4, 5]}
        />
        <MetricTile
          tone="peach"
          icon="phone_disabled"
          label="Not completed"
          value={failedCalls}
          hint="Needs follow-up"
          spark={[2, 3, 2, 3, 2, 3, 2, 3]}
        />
        <MetricTile
          tone="violet"
          icon="contacts"
          label="Contact records"
          value={contactList.length}
          hint="Users with contacts"
          spark={[2, 3, 3, 4, 4, 5, 5, 6]}
        />
      </div>

      {/* Emergency Events Table */}
      <div className="overflow-hidden rounded-[22px] border border-[#401B36]/20 bg-white shadow-card">
        <div className="flex items-center gap-3 bg-[#401B36] px-5 py-4 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B4233D]">
            <span className="material-symbols-outlined text-[18px]">emergency</span>
          </div>
          <div>
            <h2 className="text-sm font-bold">Emergency Events</h2>
            <p className="text-[11px] text-white/60">Crisis escalations and call outcomes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-[#401B36]/10 bg-[#F7F2F5]">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#401B36]">User</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#401B36]">Reason</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#401B36]">Contact</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#401B36]">Time</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#401B36]">Details</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#401B36]">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#401B36]/8">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#401B36] text-white">
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
                logs.map((log) => {
                  const critical = log.crisisRiskScore >= 0.9;
                  return (
                    <tr
                      key={log._id}
                      className={`transition-colors hover:bg-[#F7F2F5] ${
                        critical ? "bg-[#FFF5F6]" : ""
                      }`}
                    >
                      <td className="relative px-4 py-3.5">
                        {critical && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#B4233D]" />
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#401B36] bg-[#F7F2F5] text-xs font-bold text-[#401B36]">
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
                          <span className="text-xs font-bold text-[#2B1027]">
                            {log.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-[#401B36]">
                        {log.escalationReason || log.riskLevel}
                      </td>
                      <td className="space-y-1 px-4 py-3.5 text-xs">
                        <div className="font-semibold text-[#2B1027]">{log.contactCalled}</div>
                        {log.contactPhone && (
                          <div className="font-mono text-[10px] text-[#795A70]">
                            {log.contactPhone}
                          </div>
                        )}
                        {log.contactWhatsApp && (
                          <div className="font-mono text-[10px] font-semibold text-[#287D58]">
                            {log.contactWhatsApp}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="text-xs text-[#401B36]">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-0.5 text-[10px] font-bold text-[#B4233D]">
                          {timeAgo(log.createdAt)}
                        </div>
                      </td>
                      <td className="space-y-1 px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wide text-[#795A70]">
                            Risk Score:
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
                              log.crisisRiskScore >= 0.9
                                ? "bg-[#B4233D] text-white"
                                : log.crisisRiskScore >= 0.75
                                ? "bg-[#FFF5D9] text-[#946200]"
                                : "bg-[#F4F0F8] text-[#401B36]"
                            }`}
                          >
                            {log.crisisRiskScore != null
                              ? `${Math.round(log.crisisRiskScore * 100)}%`
                              : "—"}
                          </span>
                        </div>
                        {log.duration != null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wide text-[#795A70]">
                              Duration:
                            </span>
                            <span className="text-xs font-medium text-[#401B36]">
                              {log.duration}s
                            </span>
                          </div>
                        )}
                        {log.callSid && (
                          <div
                            className="max-w-[160px] truncate font-mono text-[10px] text-[#795A70]"
                            title={log.callSid}
                          >
                            SID: {log.callSid}
                          </div>
                        )}
                        {(log.error || log.twilioErrorCode) && (
                          <div className="max-w-[220px] text-[10px] font-semibold leading-snug text-[#B4233D]">
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
                            <span className="text-[10px] text-[#795A70]">—</span>
                          )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            log.outcome === "completed"
                              ? "bg-[#287D58] text-white"
                              : "bg-[#B4233D] text-white"
                          }`}
                        >
                          {log.callStatus || log.outcome}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Users with emergency contacts */}
        <div className="overflow-hidden rounded-[22px] border border-[#E9E2F2] bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-[#E9E2F2] bg-[#F0EAFE]/60 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7863C6] text-white">
              <span className="material-symbols-outlined text-[18px]">contacts</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#401B36]">Users With Emergency Contacts</h2>
              <p className="text-[11px] text-[#795A70]">Consent and auto-call readiness</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-[#E9E2F2] bg-[#FAF8FF]">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B3FA8]">User</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B3FA8]">Consent</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B3FA8]">Contacts</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B3FA8]">Auto-call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECF9]">
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
                    <tr key={idx} className="transition-colors hover:bg-[#F8F5FF]">
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-[#401B36]">
                          {record.userId?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-[#927C8B]">
                          {record.userId?.email || ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {record.consentAccepted ? (
                          <span className="badge badge-success text-[10px]">Accepted</span>
                        ) : (
                          <span className="badge badge-warning text-[10px]">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-bold text-[#401B36]">
                          {record.contactCount ?? record.contacts?.length ?? 0}
                        </span>
                        <div className="mt-1 text-[10px] text-[#927C8B]">
                          {(record.contacts || [])
                            .slice(0, 2)
                            .map((c: any) => c.name)
                            .join(", ")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {record.escalationSettings?.autoCall ? (
                          <span className="badge badge-violet text-[10px]">Enabled</span>
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
        <div className="h-fit overflow-hidden rounded-[22px] border border-[#DCE7FF] bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-[#DCE7FF] bg-[#EEF4FF] px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F7FE8] text-white">
              <span className="material-symbols-outlined text-[18px]">cell_tower</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#401B36]">Communication System</h3>
              <p className="text-[11px] text-[#795A70]">Twilio voice & WhatsApp readiness</p>
            </div>
          </div>

          <div className="divide-y divide-[#EEF4FF] px-5 py-1">
            <div className="flex items-center justify-between py-3.5 text-xs">
              <span className="text-[#795A70]">Twilio Configured</span>
              <span
                className={`badge text-[10px] ${
                  status?.system?.twilioConfigured ? "badge-success" : "badge-error"
                }`}
              >
                {status?.system?.twilioConfigured ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5 text-xs">
              <span className="text-[#795A70]">Emergency Number (Voice)</span>
              <span className="font-mono font-semibold text-[#401B36]">
                {status?.system?.twilioPhone || "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5 text-xs">
              <span className="text-[#795A70]">WhatsApp Number</span>
              <span className="font-mono font-semibold text-[#401B36]">
                {status?.system?.twilioWhatsApp || "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5 text-xs">
              <span className="text-[#795A70]">Max Escalations / Day</span>
              <span className="rounded-md bg-[#401B36] px-2 py-0.5 font-bold text-white">
                {status?.system?.maxPerDay}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
