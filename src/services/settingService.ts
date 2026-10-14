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
  twilioConfigured: boolean;
  twilioPhone: string;
}

export const settingService = {
  async getSettings(): Promise<{ settings: SystemSettings }> {
    const [settingsRes, statusRes] = await Promise.all([
      apiClient.get<{ settings: any }>("/settings"),
      apiClient.get<{ system: any }>("/emergency/status")
    ]);
    
    return {
      settings: {
        crisisEnabled: settingsRes.data.settings.crisisEnabled,
        cooldownHours: settingsRes.data.settings.cooldownHours,
        maxPerDay: settingsRes.data.settings.maxPerDay,
        twilioConfigured: statusRes.data.system.twilioConfigured,
        twilioPhone: statusRes.data.system.twilioPhone,
      },
    };
  },

  async updateSettings(update: Partial<SystemSettings>): Promise<{ settings: any }> {
    const { data } = await apiClient.put("/settings", update);
    return data;
  }
};
