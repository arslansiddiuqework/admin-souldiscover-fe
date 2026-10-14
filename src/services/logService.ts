/**
 * Admin Log Service
 * ─────────────────
 * Calls /api/admin/logs on the real backend.
 */

import { apiClient } from "./apiClient";
import type { SystemLog, Pagination } from "@/types";

export interface GetLogsParams {
  category?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  logs: SystemLog[];
  pagination: Pagination;
}

export const logService = {
  async getLogs(params: GetLogsParams): Promise<LogsResponse> {
    const { data } = await apiClient.get<LogsResponse>("/logs", { params });
    return data;
  },
};
