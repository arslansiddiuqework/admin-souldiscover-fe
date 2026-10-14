/**
 * Admin Emergency Service
 * ───────────────────────
 * Calls /api/admin/emergency/* endpoints on the real backend.
 * Read-only — admin cannot trigger or override emergencies.
 */

import { apiClient } from "./apiClient";
import type { EscalationLog, EmergencyStatus, Pagination } from "@/types";

export interface EmergencyLogsResponse {
  logs: EscalationLog[];
  pagination: Pagination;
}

export const emergencyService = {
  async getEmergencyStatus(): Promise<EmergencyStatus> {
    const { data } = await apiClient.get<EmergencyStatus>("/emergency/status");
    return data;
  },

  async getEscalationLogs(params?: { page?: number; limit?: number }): Promise<EmergencyLogsResponse> {
    const { data } = await apiClient.get<EmergencyLogsResponse>("/emergency/logs", { params });
    return data;
  },

  async getEmergencyContacts() {
    const { data } = await apiClient.get("/emergency/contacts");
    return data;
  },
};
