/**
 * Admin Analytics Service
 * ───────────────────────
 * Calls /api/admin/analytics on the real backend.
 * Returns real aggregated data from MongoDB.
 */

import { apiClient } from "./apiClient";
import type { AnalyticsResponse } from "@/types";

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsResponse> {
    const { data } = await apiClient.get<AnalyticsResponse>("/analytics");
    return data;
  },
};
