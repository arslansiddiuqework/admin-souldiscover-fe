import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import type { AnalyticsMetrics, AnalyticsTrends } from "@/types";

export function useAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsService.getAnalytics,
  });

  const defaultMetrics: AnalyticsMetrics = {
    totalUsers: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalSessions: 0,
    activeSessions: 0,
    avgSessionMinutes: 0,
    totalEscalations: 0,
    escalationsThisWeek: 0,
    totalActivities: 0,
    totalMoodEntries: 0,
    avgMoodScore: 0,
    weeklyActiveUsers: 0,
    weeklySessions: 0,
    weeklyCompletedSessions: 0,
    weeklyActivities: 0,
    weeklyCompletedActivities: 0,
    weeklyActivityCompletionRate: 0,
    weeklyHighRiskSessions: 0,
    weeklyMessageCount: 0,
    avgMessagesPerSession: 0,
    previousWeekAvgMoodScore: 0,
    outcomeTrackedUsers: 0,
    benefitedUsersThisWeek: 0,
    notRecoveredUsersThisWeek: 0,
    needsFollowUpUsers: 0,
    averageMoodChange: 0,
    recoveryRate: 0,
    totalWellnessEnrollments: 0,
    activeWellnessPlans: 0,
    completedWellnessPlans: 0,
    avgWellnessCompletionRate: 0,
    totalConsultations: 0,
    scheduledConsultations: 0,
    completedConsultations: 0,
    upcomingConsultations: 0,
  };

  const defaultTrends: AnalyticsTrends = {
    usersGrowth: [],
    sessionsPerDay: [],
    emergencyTrends: [],
    activityBreakdown: [],
    wellnessByGoal: [],
  };

  return {
    metrics: data?.metrics || defaultMetrics,
    trends: data?.trends || defaultTrends,
    isLoading,
    error,
    refetch,
  };
}
