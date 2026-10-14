import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationService } from "@/services/consultationService";

export function useConsultations(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["consultations", params],
    queryFn: () => consultationService.getConsultations(params),
    placeholderData: (prev) => prev,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "scheduled" | "completed" | "cancelled";
    }) => consultationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  return {
    consultations: data?.consultations || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
    summary: data?.summary || {
      totalBookings: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      upcoming: 0,
    },
    isLoading,
    error,
    refetch,
    updateStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
  };
}
