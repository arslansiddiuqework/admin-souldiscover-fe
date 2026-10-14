import { apiClient } from "./apiClient";
import type { Pagination } from "@/types";

export interface WellnessPlanListItem {
  _id: string;
  planId: string;
  title: string;
  catalogSlug?: string;
  primaryGoal: string;
  status: "active" | "completed" | "paused";
  challengeLevel: string;
  durationDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
}

export interface WellnessSummary {
  totalEnrollments: number;
  active: number;
  completed: number;
  paused: number;
  avgCompletionRate: number;
}

export const wellnessService = {
  async getPlans(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get<{
      plans: WellnessPlanListItem[];
      pagination: Pagination;
      summary: WellnessSummary;
    }>("/wellness", { params });
    return data;
  },

  async getPlanDetail(id: string) {
    const { data } = await apiClient.get(`/wellness/${id}`);
    return data;
  },
};
