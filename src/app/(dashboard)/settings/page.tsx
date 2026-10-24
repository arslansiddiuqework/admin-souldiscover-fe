"use client";

import React, { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricTile } from "@/components/layout/ScreenHero";

export default function SettingsPage() {
  const { settings, isLoading, isUpdating, updateSettings } = useSettings();
  const { adminUser } = useAuth();

  // Permissions validation
  const canUpdate = adminUser?.role === "superAdmin" || adminUser?.permissions?.includes("settings.update");

  // Local state for form fields
  const [crisisEnabled, setCrisisEnabled] = useState(true);
  const [cooldownHours, setCooldownHours] = useState(6);
  const [maxPerDay, setMaxPerDay] = useState(3);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Keep local state in sync with fetched settings
  useEffect(() => {
    if (settings) {
      setCrisisEnabled(settings.crisisEnabled);
      setCooldownHours(settings.cooldownHours);
      setMaxPerDay(settings.maxPerDay);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;
    setSaveSuccess(false);
    setSaveError("");

    if (!confirmPassword.trim()) {
      setSaveError("Enter your admin password to save security settings.");
      return;
    }

    try {
      await updateSettings({
        crisisEnabled,
        cooldownHours,
        maxPerDay,
        confirmPassword,
      });
      setConfirmPassword("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to save settings. Please try again.");
    }
  };

  const hasChanges = settings
    ? crisisEnabled !== settings.crisisEnabled ||
      cooldownHours !== settings.cooldownHours ||
      maxPerDay !== settings.maxPerDay
    : false;

  if (isLoading) {
    return (
      <div className="page-shell animate-pulse">
        <div className="h-36 rounded-[28px] border border-border bg-white/70" />
        <div className="h-40 rounded-[22px] border border-border bg-white/70" />
        <div className="h-64 rounded-[22px] border border-border bg-white/70" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="page-shell max-w-5xl">
      <PageHeader
        tone="violet"
        eyebrow="Operations · Configuration"
        title="System Configuration"
        description="Configure real-time clinical guardrails and safety thresholds."
        meta={
          canUpdate ? (
            <span className="badge badge-violet">Editable</span>
          ) : (
            <span className="badge badge-neutral">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              Read-only
            </span>
          )
        }
        actions={
          canUpdate ? (
            <button
              type="submit"
              disabled={!hasChanges || isUpdating}
              className={hasChanges ? "soft-btn-violet" : "soft-btn"}
            >
              {isUpdating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          ) : (
            <div className="soft-btn pointer-events-none opacity-80">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Read-Only Mode
            </div>
          )
        }
      />

      {/* Notifications */}
      {!canUpdate && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#D9CCFF] bg-[#F0EAFE] px-4 py-3 text-xs text-[#5B3FA8] shadow-xs">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>
            You are logged in as a Standard Administrator. System-wide parameters are view-only.
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#287D58]/25 bg-[#EAF7EF] px-4 py-3 text-xs text-[#287D58]">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>System settings updated and synchronized with MongoDB successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-xs text-on-error-container">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{saveError}</span>
        </div>
      )}

      {/* Live readout */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          tone={crisisEnabled ? "mint" : "alert"}
          icon="emergency"
          label="Crisis engine"
          value={crisisEnabled ? "On" : "Off"}
          hint={hasChanges ? "Unsaved change" : "Synced"}
        />
        <MetricTile
          tone="violet"
          icon="speed"
          label="Max / day"
          value={maxPerDay}
          hint="Escalations per user"
          spark={[2, 3, 3, 4, 3, 4, 4, 5]}
        />
        <MetricTile
          tone="sky"
          icon="timer"
          label="Cooldown"
          value={`${cooldownHours}h`}
          hint="Between escalations"
          spark={[4, 4, 5, 5, 6, 6, 6, 7]}
        />
        <MetricTile
          tone={settings?.smsConfigured ? "mint" : "peach"}
          icon="sms"
          label="TextBee SMS"
          value={settings?.smsConfigured ? "Ready" : "Missing"}
          hint="Voice unavailable"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Global Features Section */}
        <div className="overflow-hidden rounded-[22px] border border-[#E3DBF5] bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-[#E3DBF5] bg-gradient-to-r from-[#F0EAFE] to-[#FAF8FF] px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C69EF] to-[#7863C6] text-white shadow-violet">
              <span className="material-symbols-outlined text-[18px]">settings_system_daydream</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#49263D]">Global System Features</h3>
              <p className="text-[11px] text-[#795A70]">Crisis engine and TextBee SMS status</p>
            </div>
          </div>

          <div className="divide-y divide-[#EDE7F7] px-5 py-1">
            <div className="flex items-start justify-between gap-4 py-5">
              <div>
                <p className="text-sm font-semibold text-[#49263D]">Crisis Escalation Engine</p>
                <p className="mt-1 max-w-[320px] text-xs leading-relaxed text-[#795A70]">
                  Enables automated emergency SMS via TextBee during high-risk mental health
                  events. Voice calling is not configured.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={crisisEnabled}
                disabled={!canUpdate}
                onClick={() => setCrisisEnabled(!crisisEnabled)}
                className={`relative mt-0.5 inline-flex h-7 w-12 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  crisisEnabled
                    ? "bg-gradient-to-r from-[#7C69EF] to-[#7863C6]"
                    : "bg-[#D8CFE3]"
                } ${!canUpdate ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    crisisEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 py-5">
              <div>
                <p className="text-sm font-semibold text-[#49263D]">TextBee SMS</p>
                <p className="mt-1 max-w-[320px] text-xs leading-relaxed text-[#795A70]">
                  Server-side TextBee API status from environment credentials. API keys are never
                  returned to the browser.
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`badge text-[10px] ${
                    settings?.smsConfigured ? "badge-success" : "badge-error"
                  }`}
                >
                  {settings?.smsConfigured ? "Configured" : "Missing Credentials"}
                </span>
                <p className="mt-1.5 text-[10px] text-[#927C8B]">
                  Voice: {settings?.voiceStatus || "VOICE_UNAVAILABLE"}
                </p>
                {!settings?.emergencyFullyOperational && settings?.smsConfigured && (
                  <p className="mt-1 max-w-[160px] text-[10px] leading-snug text-[#B74783]">
                    SMS ready — voice escalation not available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Tuning Section */}
        <div className="overflow-hidden rounded-[22px] border border-[#DCE7FF] bg-white shadow-card">
          <div className="flex items-center gap-2.5 border-b border-[#DCE7FF] bg-gradient-to-r from-[#EEF4FF] to-[#FAFCFF] px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B8DEF] to-[#4F7FE8] text-white shadow-sky">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#49263D]">Escalation Tuning</h3>
              <p className="text-[11px] text-[#795A70]">Daily caps and cooldown windows</p>
            </div>
          </div>

          <div className="divide-y divide-[#EEF4FF] px-5 py-1">
            <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-[#49263D]">Max Escalations Per Day</p>
                <p className="mt-1 max-w-[320px] text-xs leading-relaxed text-[#795A70]">
                  The maximum number of times the system can call emergency contacts for a single
                  user in 24 hours.
                </p>
              </div>
              <div className="field-shell w-24 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="50"
                  disabled={!canUpdate}
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(parseInt(e.target.value) || 0)}
                  className="field-input px-2 py-1.5 text-center font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-[#49263D]">Cooldown Hours</p>
                <p className="mt-1 max-w-[320px] text-xs leading-relaxed text-[#795A70]">
                  Hours to wait before escalating the same user again after a successful emergency
                  contact.
                </p>
              </div>
              <div className="field-shell w-24 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="168"
                  step="0.5"
                  disabled={!canUpdate}
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(parseFloat(e.target.value) || 0)}
                  className="field-input px-2 py-1.5 text-center font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {canUpdate && (
              <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-[#49263D]">
                    Confirm with password
                  </p>
                  <p className="mt-1 max-w-[320px] text-xs leading-relaxed text-[#795A70]">
                    Step-up authentication is required before changing crisis settings.
                  </p>
                </div>
                <div className="field-shell w-full max-w-[220px] shrink-0">
                  <input
                    type="password"
                    autoComplete="current-password"
                    disabled={!canUpdate || !hasChanges}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Admin password"
                    className="field-input px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
