import { apiClient } from "./apiClient";
import type { AiUsageResponse } from "@/types";

export const aiUsageService = {
  async getAiUsage(): Promise<AiUsageResponse> {
    const { data } = await apiClient.get<AiUsageResponse>("/ai-usage");
    return data;
  },
};
