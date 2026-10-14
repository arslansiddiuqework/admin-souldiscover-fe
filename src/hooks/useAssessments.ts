import { useQuery } from "@tanstack/react-query";
import { assessmentService } from "@/services/assessmentService";

export function useAssessments(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assessments", params],
    queryFn: () => assessmentService.getList(params),
    placeholderData: (prev) => prev,
  });

  return {
    assessments: data?.assessments || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 },
    summary: data?.summary || {
      published: 0,
      coming_soon: 0,
      draft: 0,
      archived: 0,
      totalCompletions: 0,
    },
    isLoading,
    error,
    refetch,
  };
}
