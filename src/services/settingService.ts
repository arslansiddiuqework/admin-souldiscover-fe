/**
 * Admin Settings Service
 * ──────────────────────
 * Manage system-wide emergency tuning and integration states.
 * Connects directly to real database-backed endpoints.
 */

import { apiClient } from "./apiClient";

export interface SystemSettings {
  crisisEnabled: boolean;
  cooldownHours: number;
  maxPerDay: number;
  smsConfigured: boolean;
  smsProvider: string;
  voiceStatus: string;
  emergencyFullyOperational: boolean;
  /** @deprecated use smsConfigured */
  twilioConfigured: boolean;
  twilioPhone: string;
}

export const settingService = {
  async getSettings(): Promise<{ settings: SystemSettings }> {
    const [settingsRes, statusRes] = await Promise.all([
      apiClient.get<{ settings: any }>("/settings"),
      apiClient.get<{ system: any }>("/emergency/status"),
    ]);

    const system = statusRes.data.system || {};

    return {
      settings: {
        crisisEnabled: settingsRes.data.settings.crisisEnabled,
        cooldownHours: settingsRes.data.settings.cooldownHours,
        maxPerDay: settingsRes.data.settings.maxPerDay,
        smsConfigured: Boolean(system.smsConfigured ?? system.textbeeConfigured),
        smsProvider: system.smsProvider || "textbee",
        voiceStatus: system.voiceStatus || "VOICE_UNAVAILABLE",
        emergencyFullyOperational: Boolean(system.emergencyFullyOperational),
        twilioConfigured: false,
        twilioPhone: "Not configured (Twilio removed)",
      },
    };
  },

  async updateSettings(
    update: Partial<SystemSettings> & { confirmPassword: string }
  ): Promise<{ settings: any }> {
    const { data } = await apiClient.put("/settings", update);
    return data;
  },
};
