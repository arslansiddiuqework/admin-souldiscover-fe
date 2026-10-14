import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import type { AdminProfile } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: authData, isLoading: isCheckingAuth, error } = useQuery({
    queryKey: ["adminMe"],
    queryFn: () => authService.me().catch(() => ({ authenticated: false, admin: null })),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["adminMe"], { authenticated: true, admin: data.admin });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(["adminMe"], { authenticated: false, admin: null });
      queryClient.clear();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["adminMe"], { authenticated: true, admin: data.admin });
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: authService.deleteAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(["adminMe"], { authenticated: true, admin: data.admin });
    },
  });

  return {
    isAuthenticated: !!authData?.authenticated,
    adminUser: (authData as any)?.admin as AdminProfile | null,
    isCheckingAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
    isDeletingAvatar: deleteAvatarMutation.isPending,
  };
}
