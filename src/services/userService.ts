/**
 * Admin User Service
 * ──────────────────
 * Calls /api/admin/users/* endpoints on the real backend.
 */

import { apiClient } from "./apiClient";
import type { AdminUser, Pagination } from "@/types";

export interface GetUsersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export const userService = {
  async getUsers(params: GetUsersParams): Promise<UsersResponse> {
    const { data } = await apiClient.get<UsersResponse>("/users", { params });
    return data;
  },

  async getUserDetail(id: string) {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },

  async updateUserStatus(payload: { id: string; status: "active" | "suspended" }): Promise<{ message: string; user: any }> {
    const { data } = await apiClient.patch(`/users/${payload.id}/status`, { status: payload.status });
    return data;
  },
};
