import { useQuery } from "@tanstack/react-query";
import { engagementService } from "@/services/engagementService";

export function useEngagement() {
  return useQuery({
    queryKey: ["engagement"],
    queryFn: engagementService.getEngagement,
  });
}
