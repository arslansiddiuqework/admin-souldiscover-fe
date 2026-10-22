"use client";

import React from "react";
import { useEmergency } from "@/hooks/useEmergency";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PageHeader } from "@/components/layout/PageHeader";

type PulseAccent = "orchid" | "alert" | "peach" | "mint" | "sky";

const PULSE: Record<PulseAccent, { well: string }> = {
  orchid: { well: "bg-[#FFE5F0] text-[#B74783]" },
  alert: { well: "bg-[#FFF0F2] text-[#B4233D]" },
  peach: { well: "bg-[#FFF1E9] text-[#C46B4A]" },
  mint: { well: "bg-[#EAF7EF] text-[#287D58]" },
  sky: { well: "bg-[#EEF4FF] text-[#4F7FE8]" },
};

function PulseStat({
  label,
  value,
  hint,
  icon,
  accent = "orchid",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: string;
  accent?: PulseAccent;
}) {
  return (
    <div className="rounded-2xl border border-[#EADCE5]/90 bg-white/80 px-3.5 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${PULSE[accent].well}`}
        >
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#927C8B]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-[#49263D] tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-[#795A70]">{hint}</p> : null}
    </div>
  );
}

function outcomeBadge(outcome?: string, callStatus?: string) {
  const label = callStatus || outcome || "—";
  if (outcome === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#EAF7EF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#287D58] ring-1 ring-[#287D58]/15">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#FFF0F2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B4233D] ring-1 ring-[#B4233D]/15">
      {label}
    </span>
  );
}

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
        <div className="h-40 rounded-[28px] bg-gradient-to-br from-[#FFE5F0] to-[#F0EAFE]" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-[#EADCE5] bg-white/70" />
          ))}
        </div>
        <div className="h-72 rounded-[22px] border border-[#EADCE5] bg-white/70" />
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
        tone="orchid"
        eyebrow="Safety operations · Crisis console"
        title="Emergency Control Panel"
        description="Monitor system-level emergency response behavior. (Read Only)"
        meta={
          <>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${
                isEmergencyActive
                  ? "bg-[#EAF7EF] text-[#287D58] ring-[#287D58]/20"
                  : "bg-[#FFF0F2] text-[#B4233D] ring-[#B4233D]/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isEmergencyActive
                    ? "animate-pulse bg-[#287D58]"
                    : "animate-pulse bg-[#B4233D]"
                }`}
              />
              {isEmergencyActive ? "Crisis system enabled" : "Crisis system disabled"}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#795A70] ring-1 ring-[#EADCE5]">
              {logs.length} recent events
            </span>
          </>
        }
        aside={
          <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center lg:mx-0 lg:h-32 lg:w-32">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFE5F0] to-[#FFF0F2] ring-1 ring-[#B74783]/15"
            />
            <span
              aria-hidden
              className="absolute inset-3 rounded-full bg-white/60 ring-1 ring-[#B74783]/10"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F08596] to-[#B4233D] text-white shadow-[0_12px_28px_rgba(180,35,61,0.28)] ring-2 ring-white">
              <span className="material-symbols-outlined text-[36px]">emergency</span>
            </div>
          </div>
        }
      />

      {/* Soft status strip — light, not dark */}
      <div
        className={`relative overflow-hidden rounded-[22px] border p-5 shadow-card ${
          isEmergencyActive
            ? "border-[#287D58]/20 bg-gradient-to-br from-[#EAF7EF] via-white to-[#F7FBF8]"
            : "border-[#B4233D]/20 bg-gradient-to-br from-[#FFF0F2] via-white to-[#FFF8F9]"
        }`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full blur-3xl ${
            isEmergencyActive ? "bg-[#86EFAC]/35" : "bg-[#FDA4AF]/40"
          }`}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                isEmergencyActive
                  ? "bg-[#EAF7EF] text-[#287D58] ring-1 ring-[#287D58]/15"
                  : "bg-[#FFF0F2] text-[#B4233D] ring-1 ring-[#B4233D]/15"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isEmergencyActive ? "health_and_safety" : "warning"}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#927C8B]">
                System status
              </p>
              <p className="mt-1 text-base font-bold text-[#49263D]">
                Emergency response system is currently{" "}
                <span className={isEmergencyActive ? "text-[#287D58]" : "text-[#B4233D]"}>
                  {isEmergencyActive ? "Enabled" : "Disabled"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-[#795A70]">
                {isEmergencyActive
                  ? "Escalations will trigger outbound contact flows."
                  : "Escalations will NOT trigger outbound contact flows."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ring-1 ${
                isEmergencyActive
                  ? "bg-[#EAF7EF] text-[#287D58] ring-[#287D58]/20"
                  : "bg-[#FFF0F2] text-[#B4233D] ring-[#B4233D]/20"
              }`}
            >
              {isEmergencyActive ? "Active" : "Inactive"}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isEmergencyActive
                  ? "animate-pulse bg-[#287D58]"
                  : "animate-pulse bg-[#B4233D]"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PulseStat
          accent="alert"
          icon="emergency"
          label="Recent events"
          value={logs.length}
          hint="Escalation log"
        />
        <PulseStat
          accent="alert"
          icon="priority_high"
          label="High risk"
          value={highRisk}
          hint="Score ≥ 90%"
        />
        <PulseStat
          accent="peach"
          icon="phone_disabled"
          label="Not completed"
          value={failedCalls}
          hint="Needs follow-up"
        />
        <PulseStat
          accent="orchid"
          icon="contacts"
          label="Contact records"
          value={contactList.length}
          hint="Users with contacts"
        />
      </div>

      {/* Emergency Events — blush orchid console (no dark plum header) */}
      <div className="overflow-hidden rounded-[22px] border border-[#EADCE5]/90 bg-white shadow-card">
        <div className="relative flex items-center justify-between gap-3 border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB] via-white to-[#FFF0F2]/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0F2] text-[#B4233D] ring-1 ring-[#B4233D]/15">
              <span className="material-symbols-outlined text-[20px]">emergency</span>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#49263D]">
                Emergency Events
              </h2>
              <p className="text-[11px] text-[#927C8B]">
                Crisis escalations and call outcomes
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-[#FFE5F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B74783]">
            Live feed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-[#EADCE5]/80 bg-[#FFF8FB]/80">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                  User
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                  Reason
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                  Contact
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                  Time
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                  Details
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F3EAF0]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE5F0] to-[#FFF0F2] text-[#B74783] ring-1 ring-[#B74783]/15">
                        <span className="material-symbols-outlined text-[28px]">
                          health_and_safety
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#49263D]">
                          No emergency events
                        </p>
                        <p className="mt-1 max-w-[280px] text-xs text-[#927C8B]">
                          Crisis escalations will appear here when triggered.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const critical = log.crisisRiskScore >= 0.9;
                  return (
                    <tr
                      key={log._id}
                      className={`transition-colors hover:bg-[#FFF8FB] ${
                        critical ? "bg-[#FFF5F7]" : ""
                      }`}
                    >
                      <td className="relative px-4 py-3.5">
                        {critical && (
                          <span className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-[#B4233D]" />
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#EADCE5] bg-[#FFF0F6] text-xs font-bold text-[#B74783]">
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
                          <span className="text-xs font-bold text-[#49263D]">
                            {log.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-[#795A70]">
                        {log.escalationReason || log.riskLevel}
                      </td>
                      <td className="space-y-1 px-4 py-3.5 text-xs">
                        <div className="font-semibold text-[#49263D]">
                          {log.contactCalled}
                        </div>
                        {log.contactPhone && (
                          <div className="font-mono text-[10px] text-[#927C8B]">
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
                        <div className="text-xs text-[#795A70]">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-0.5 text-[10px] font-bold text-[#B74783]">
                          {timeAgo(log.createdAt)}
                        </div>
                      </td>
                      <td className="space-y-1 px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wide text-[#927C8B]">
                            Risk Score:
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
                              log.crisisRiskScore >= 0.9
                                ? "bg-[#FFF0F2] text-[#B4233D] ring-1 ring-[#B4233D]/20"
                                : log.crisisRiskScore >= 0.75
                                ? "bg-[#FFF5D9] text-[#946200] ring-1 ring-[#946200]/20"
                                : "bg-[#F4F0F8] text-[#795A70]"
                            }`}
                          >
                            {log.crisisRiskScore != null
                              ? `${Math.round(log.crisisRiskScore * 100)}%`
                              : "—"}
                          </span>
                        </div>
                        {log.duration != null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wide text-[#927C8B]">
                              Duration:
                            </span>
                            <span className="text-xs font-medium text-[#795A70]">
                              {log.duration}s
                            </span>
                          </div>
                        )}
                        {log.callSid && (
                          <div
                            className="max-w-[160px] truncate font-mono text-[10px] text-[#927C8B]"
                            title={log.callSid}
                          >
                            SID: {log.callSid}
                          </div>
                        )}
                        {(log.error || log.twilioErrorCode) && (
                          <div className="max-w-[220px] text-[10px] font-semibold leading-snug text-[#B4233D]">
                            {log.error}
                            {log.twilioErrorCode && (
                              <span className="ml-1 opacity-70">
                                ({log.twilioErrorCode})
                              </span>
                            )}
                          </div>
                        )}
                        {!log.duration &&
                          !log.callSid &&
                          !log.error &&
                          !log.twilioErrorCode &&
                          log.crisisRiskScore == null && (
                            <span className="text-[10px] text-[#927C8B]">—</span>
                          )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {outcomeBadge(log.outcome, log.callStatus)}
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
        <div className="overflow-hidden rounded-[22px] border border-[#EADCE5]/90 bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB] to-white px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE5F0] text-[#B74783]">
              <span className="material-symbols-outlined text-[18px]">contacts</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#49263D]">
                Users With Emergency Contacts
              </h2>
              <p className="text-[11px] text-[#927C8B]">Consent and auto-call readiness</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-[#EADCE5]/80 bg-[#FFF8FB]/80">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                    User
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                    Consent
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                    Contacts
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
                    Auto-call
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EAF0]">
                {!Array.isArray(contacts) || contacts.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE5F0] text-[#B74783]">
                          <span className="material-symbols-outlined text-[24px]">
                            contact_phone
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#49263D]">
                            No emergency contact records
                          </p>
                          <p className="mt-1 text-xs text-[#927C8B]">
                            Records will appear once users add emergency contacts.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.slice(0, 25).map((record: any, idx: number) => (
                    <tr key={idx} className="transition-colors hover:bg-[#FFF8FB]">
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-[#49263D]">
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
                        <span className="font-bold text-[#49263D]">
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
        <div className="h-fit overflow-hidden rounded-[22px] border border-[#DCE7FF]/90 bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-[#DCE7FF]/80 bg-gradient-to-r from-[#EEF4FF] to-white px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#4F7FE8]">
              <span className="material-symbols-outlined text-[18px]">cell_tower</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#49263D]">Communication System</h3>
              <p className="text-[11px] text-[#927C8B]">Twilio voice & WhatsApp readiness</p>
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
              <span className="font-mono font-semibold text-[#49263D]">
                {status?.system?.twilioPhone || "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5 text-xs">
              <span className="text-[#795A70]">WhatsApp Number</span>
              <span className="font-mono font-semibold text-[#49263D]">
                {status?.system?.twilioWhatsApp || "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5 text-xs">
              <span className="text-[#795A70]">Max Escalations / Day</span>
              <span className="rounded-full bg-[#FFE5F0] px-2.5 py-0.5 font-bold text-[#B74783]">
                {status?.system?.maxPerDay}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
