import { useQuery } from "@tanstack/react-query";
import { wellnessService } from "@/services/wellnessService";

export function useWellness(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["wellness", params],
    queryFn: () => wellnessService.getPlans(params),
    placeholderData: (prev) => prev,
  });

  return {
    plans: data?.plans || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
    summary: data?.summary || {
      totalEnrollments: 0,
      active: 0,
      completed: 0,
      paused: 0,
      avgCompletionRate: 0,
    },
    isLoading,
    error,
    refetch,
  };
}
