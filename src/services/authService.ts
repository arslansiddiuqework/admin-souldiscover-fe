/**
 * Admin Auth Service
 * ──────────────────
 * Calls /api/admin/auth/* endpoints on the real backend.
 * Manages adminAccessToken in localStorage.
 */

import { apiClient } from "./apiClient";
import type { AdminLoginResponse, AdminMeResponse } from "@/types";

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AdminLoginResponse> {
    const { data } = await apiClient.post<AdminLoginResponse>("/auth/login", credentials);
    // Store admin token (separate from user token)
    if (data.token && typeof window !== "undefined") {
      localStorage.setItem("adminAccessToken", data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminAccessToken");
      }
    }
  },

  async me(): Promise<AdminMeResponse> {
    const { data } = await apiClient.get<AdminMeResponse>("/auth/me");
    return data;
  },

  async updateProfile(params: { name?: string; profileImage?: string }): Promise<{ admin: AdminMeResponse["admin"] }> {
    const { data } = await apiClient.put("/auth/profile", params);
    return data;
  },

  async uploadAvatar(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await apiClient.post<{ imageUrl: string }>("/auth/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async deleteAvatar(): Promise<{ admin: AdminMeResponse["admin"] }> {
    const { data } = await apiClient.delete("/auth/delete-avatar");
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/reset-password", { token, password });
    return data;
  },
};
