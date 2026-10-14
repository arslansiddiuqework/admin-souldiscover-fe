import { apiClient } from "./apiClient";
import type { Pagination } from "@/types";

export interface ConsultationListItem {
  _id: string;
  bookingId: string;
  psychologistId: string;
  psychologistName: string;
  date: string;
  time: string;
  durationMinutes: number;
  priceUsd: number;
  status: "scheduled" | "completed" | "cancelled";
  clientName: string;
  clientEmail: string;
  reason: string;
  notes?: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
}

export interface ConsultationSummary {
  totalBookings: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  upcoming: number;
}

export const consultationService = {
  async getConsultations(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get<{
      consultations: ConsultationListItem[];
      pagination: Pagination;
      summary: ConsultationSummary;
    }>("/consultations", { params });
    return data;
  },

  async updateStatus(id: string, status: "scheduled" | "completed" | "cancelled") {
    const { data } = await apiClient.patch(`/consultations/${id}/status`, { status });
    return data;
  },
};
