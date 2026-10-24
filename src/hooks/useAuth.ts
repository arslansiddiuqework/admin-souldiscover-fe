import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import type { AdminProfile } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  // localStorage is unavailable during SSR. Defer reading the token until after
  // mount so the first client paint matches the server HTML (no hydration toast).
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  const hasToken =
    sessionReady &&
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("adminAccessToken"));

  const { data: authData, isLoading: isAuthQueryLoading, isFetched } = useQuery({
    queryKey: ["adminMe"],
    queryFn: () =>
      authService.me().catch(() => ({ authenticated: false, admin: null })),
    retry: false,
    // Avoid a guaranteed 401 round-trip when there is no session.
    enabled: hasToken,
  });

  // Before sessionReady: treat as checking (SSR + first client paint).
  // With a token: wait until /me settles.
  const isCheckingAuth =
    !sessionReady || (hasToken && (isAuthQueryLoading || !isFetched));

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if ("mfaRequired" in data && data.mfaRequired) return;
      if ("admin" in data && data.admin) {
        queryClient.setQueryData(["adminMe"], {
          authenticated: true,
          admin: data.admin,
        });
      }
    },
  });

  const mfaVerifyMutation = useMutation({
    mutationFn: authService.verifyMfa,
    onSuccess: (data) => {
      queryClient.setQueryData(["adminMe"], {
        authenticated: true,
        admin: data.admin,
      });
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
    verifyMfa: mfaVerifyMutation.mutateAsync,
    isVerifyingMfa: mfaVerifyMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
    isDeletingAvatar: deleteAvatarMutation.isPending,
  };
}
