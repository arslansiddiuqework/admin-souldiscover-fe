/**
 * Admin Session Service
 * ─────────────────────
 * Calls /api/admin/sessions/* endpoints on the real backend.
 */

import { apiClient } from "./apiClient";
import type { SessionListItem, SessionDetail, Pagination } from "@/types";

export interface GetSessionsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SessionsResponse {
  sessions: SessionListItem[];
  pagination: Pagination;
}

export const sessionService = {
  async getSessions(params: GetSessionsParams): Promise<SessionsResponse> {
    const { data } = await apiClient.get<SessionsResponse>("/sessions", { params });
    return data;
  },

  async getSessionDetail(sessionId: string): Promise<SessionDetail> {
    const { data } = await apiClient.get<SessionDetail>(`/sessions/${sessionId}`);
    return data;
  },

  async updateSessionStatus(sessionId: string, status: "active" | "completed" | "archived"): Promise<any> {
    const { data } = await apiClient.patch<any>(`/sessions/${sessionId}/status`, { status });
    return data;
  },

  async getUserSessions(userId: string): Promise<any[]> {
    const { data } = await apiClient.get<SessionsResponse>("/sessions", {
      params: { userId, limit: 100 }
    });
    return data.sessions;
  },
};
