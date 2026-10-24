import { useQuery } from "@tanstack/react-query";
import { aiUsageService } from "@/services/aiUsageService";

export function useAiUsage() {
  return useQuery({
    queryKey: ["ai-usage"],
    queryFn: aiUsageService.getAiUsage,
  });
}
