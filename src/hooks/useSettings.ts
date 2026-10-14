import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingService, SystemSettings } from "@/services/settingService";

export function useSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: settingService.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (update: Partial<SystemSettings>) => settingService.updateSettings(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return {
    settings: data?.settings || null,
    isLoading,
    isUpdating: updateMutation.isPending,
    updateSettings: updateMutation.mutateAsync,
    error,
    refetch,
  };
}
