/**
 * Admin Auth Service
 * Manages adminAccessToken in localStorage (Bearer threat model documented in security report).
 */

import { apiClient } from "./apiClient";
import type { AdminLoginResponse, AdminMeResponse } from "@/types";

export type AdminLoginResult =
  | (AdminLoginResponse & { mfaRequired?: false })
  | {
      mfaRequired: true;
      mfaToken: string;
      message: string;
    };

export const authService = {
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AdminLoginResult> {
    const { data } = await apiClient.post<AdminLoginResult>(
      "/auth/login",
      credentials
    );
    if ("mfaRequired" in data && data.mfaRequired) {
      return data;
    }
    if ("token" in data && data.token && typeof window !== "undefined") {
      localStorage.setItem("adminAccessToken", data.token);
    }
    return data;
  },

  async verifyMfa(params: {
    mfaToken: string;
    code: string;
  }): Promise<AdminLoginResponse> {
    const { data } = await apiClient.post<AdminLoginResponse>(
      "/auth/mfa/verify",
      params
    );
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

  async updateProfile(params: {
    name?: string;
    profileImage?: string;
  }): Promise<{ admin: AdminMeResponse["admin"] }> {
    const { data } = await apiClient.put("/auth/profile", params);
    return data;
  },

  async uploadAvatar(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await apiClient.post<{ imageUrl: string }>(
      "/auth/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
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

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return data;
  },

  async mfaSetup(confirmPassword: string): Promise<{
    secret: string;
    otpauthUrl: string;
    message: string;
  }> {
    const { data } = await apiClient.post("/auth/mfa/setup", {
      confirmPassword,
    });
    return data;
  },

  async mfaEnable(params: {
    confirmPassword: string;
    code: string;
  }): Promise<{
    recoveryCodes: string[];
    token: string;
    admin: AdminMeResponse["admin"];
    message: string;
  }> {
    const { data } = await apiClient.post("/auth/mfa/enable", params);
    if (data.token && typeof window !== "undefined") {
      localStorage.setItem("adminAccessToken", data.token);
    }
    return data;
  },

  async mfaDisable(params: {
    confirmPassword: string;
    code: string;
  }): Promise<{ token: string; admin: AdminMeResponse["admin"]; message: string }> {
    const { data } = await apiClient.post("/auth/mfa/disable", params);
    if (data.token && typeof window !== "undefined") {
      localStorage.setItem("adminAccessToken", data.token);
    }
    return data;
  },
};
