import { apiClient } from "./apiClient";
import type { Pagination } from "@/types";

export interface AssessmentListItem {
  id: string;
  slug: string;
  title: string;
  version: string;
  status: string;
  category: string;
  typeBadge: string;
  clinicallyValidated: boolean;
  licenseSource: string;
  licenseNotes?: string;
  questionCount: number;
  completions: number;
  effectiveDate: string;
}

export interface AssessmentSummary {
  published: number;
  coming_soon: number;
  draft: number;
  archived: number;
  totalCompletions: number;
}

export interface AssessmentResultRow {
  resultId: string;
  assessmentSlug: string;
  title: string;
  instrumentVersion: string;
  summary: string;
  completedAt: string;
  interpretationLabel: string | null;
  scoringMethod: string | null;
  totalScore: number | null;
  maxScore: number | null;
  clinicallyValidated: boolean;
  user: { id: string; name: string; email: string };
}

export const assessmentService = {
  async getList(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get<{
      assessments: AssessmentListItem[];
      pagination: Pagination;
      summary: AssessmentSummary;
    }>("/assessments", { params });
    return data;
  },

  async getDetail(slug: string) {
    const { data } = await apiClient.get(`/assessments/${encodeURIComponent(slug)}`);
    return data;
  },

  async getResults(params?: {
    page?: number;
    limit?: number;
    slug?: string;
    userId?: string;
  }) {
    const { data } = await apiClient.get<{
      results: AssessmentResultRow[];
      pagination: Pagination;
      funnel: { inProgressSessions: number; abandonedSessions: number };
      note?: string;
    }>("/assessments/results", { params });
    return data;
  },
};
