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
};
