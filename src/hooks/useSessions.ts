import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, GetSessionsParams } from "@/services/sessionService";

export function useSessions(params: GetSessionsParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sessions", params],
    queryFn: () => sessionService.getSessions(params),
    placeholderData: (prev) => prev,
  });

  const statusMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: "active" | "completed" | "archived" }) =>
      sessionService.updateSessionStatus(sessionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  return {
    sessions: data?.sessions || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
    isLoading,
    error,
    refetch,
    updateSessionStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
  };
}
