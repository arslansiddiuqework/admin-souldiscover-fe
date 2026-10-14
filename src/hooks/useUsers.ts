import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, GetUsersParams } from "@/services/userService";

export function useUsers(params: GetUsersParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: userService.updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  return {
    users: data?.users || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
    isLoading,
    error,
    refetch,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateUserStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
  };
}
