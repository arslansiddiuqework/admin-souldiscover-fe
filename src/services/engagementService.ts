import { apiClient } from "./apiClient";
import type { EngagementResponse } from "@/types";

export const engagementService = {
  async getEngagement(): Promise<EngagementResponse> {
    const { data } = await apiClient.get<EngagementResponse>("/engagement");
    return data;
  },
};
