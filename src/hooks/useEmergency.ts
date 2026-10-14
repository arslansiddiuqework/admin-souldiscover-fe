import { useQuery } from "@tanstack/react-query";
import { emergencyService } from "@/services/emergencyService";

export function useEmergency() {
  const statusQuery = useQuery({
    queryKey: ["emergency", "status"],
    queryFn: emergencyService.getEmergencyStatus,
  });

  const logsQuery = useQuery({
    queryKey: ["emergency", "logs"],
    queryFn: () => emergencyService.getEscalationLogs({ page: 1, limit: 20 }),
  });

  const contactsQuery = useQuery({
    queryKey: ["emergency", "contacts"],
    queryFn: emergencyService.getEmergencyContacts,
  });

  return {
    status: statusQuery.data || null,
    logs: logsQuery.data?.logs || [],
    logsPagination: logsQuery.data?.pagination || null,
    contacts: contactsQuery.data?.contacts || contactsQuery.data || [],
    isLoading: statusQuery.isLoading || logsQuery.isLoading || contactsQuery.isLoading,
    error: statusQuery.error || logsQuery.error || contactsQuery.error,
    refetch: () => {
      statusQuery.refetch();
      logsQuery.refetch();
      contactsQuery.refetch();
    },
  };
}
