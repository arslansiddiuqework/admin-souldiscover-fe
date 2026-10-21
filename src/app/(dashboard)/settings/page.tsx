"use client";

import React, { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";

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

    try {
      await updateSettings({
        crisisEnabled,
        cooldownHours,
        maxPerDay,
      });
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
    <form onSubmit={handleSave} className="page-shell max-w-4xl">
      <PageHeader
        eyebrow="Configuration"
        title="System Configuration"
        description="Configure real-time clinical guardrails and safety thresholds."
        meta={
          canUpdate ? (
            <span className="badge badge-primary">Editable</span>
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
              className={hasChanges ? "soft-btn-primary" : "soft-btn"}
            >
              {isUpdating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
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
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-[#FFF8FB]/90 px-4 py-3 text-xs text-on-surface-variant shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
          <span>
            You are logged in as a Standard Administrator. System-wide parameters are view-only.
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary-container px-4 py-3 text-xs text-on-primary-container">
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

      {/* Global Features Section */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">settings_system_daydream</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Global System Features</h3>
              <p className="text-[11px] text-on-surface-muted">Crisis engine and Twilio status</p>
            </div>
          </div>
        </div>

        <div className="space-y-0 divide-y divide-border px-5 py-1">
          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium text-on-surface">Crisis Escalation Engine</p>
              <p className="mt-1 max-w-[500px] text-xs text-on-surface-variant">
                Enables automated Twilio phone calls and SMS messages during high-risk mental health
                events.
              </p>
            </div>
            <button
              type="button"
              disabled={!canUpdate}
              onClick={() => setCrisisEnabled(!crisisEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                crisisEnabled ? "bg-primary" : "bg-surface-container-high"
              } ${!canUpdate ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  crisisEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="text-sm font-medium text-on-surface">Twilio Integration</p>
              <p className="mt-1 max-w-[500px] text-xs text-on-surface-variant">
                Active Twilio API status. Configuration is derived from system environment
                credentials.
              </p>
            </div>
            <div className="text-right">
              <span
                className={`badge text-[10px] ${
                  settings?.twilioConfigured ? "badge-success" : "badge-error"
                }`}
              >
                {settings?.twilioConfigured ? "Configured" : "Missing Credentials"}
              </span>
              {settings?.twilioPhone && settings.twilioPhone !== "Not configured" && (
                <p className="mt-1.5 font-mono text-[10px] text-on-surface-muted">
                  {settings.twilioPhone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Tuning Section */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2.5">
            <div className="stat-icon !h-9 !w-9 !rounded-xl">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Escalation Tuning</h3>
              <p className="text-[11px] text-on-surface-muted">Daily caps and cooldown windows</p>
            </div>
          </div>
        </div>

        <div className="space-y-0 divide-y divide-border px-5 py-1">
          <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-on-surface">Max Escalations Per Day</p>
              <p className="mt-1 max-w-[500px] text-xs text-on-surface-variant">
                The maximum number of times the system can call emergency contacts for a single user
                in 24 hours.
              </p>
            </div>
            <div className="field-shell w-24">
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
              <p className="text-sm font-medium text-on-surface">Cooldown Hours</p>
              <p className="mt-1 max-w-[500px] text-xs text-on-surface-variant">
                Hours to wait before escalating the same user again after a successful emergency
                contact.
              </p>
            </div>
            <div className="field-shell w-24">
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
        </div>
      </div>
    </form>
  );
}
