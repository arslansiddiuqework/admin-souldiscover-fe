/**
 * Admin API Client
 * ────────────────
 * Axios instance configured for the real backend.
 * Uses adminAccessToken (separate from user accessToken).
 * Includes JWT interceptor and error handling.
 */

import axios from "axios";

const BACKEND_URL_RAW = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const BACKEND_URL = BACKEND_URL_RAW.endsWith('/') ? BACKEND_URL_RAW.slice(0, -1) : BACKEND_URL_RAW;

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/admin`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Request interceptor: attach admin JWT ─────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminAccessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 safely ───────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clean up token
      localStorage.removeItem("adminAccessToken");
      // Dispatch event instead of hard redirect to prevent ERR_INVALID_REDIRECT
      window.dispatchEvent(new CustomEvent('admin-auth-error'));
    }
    return Promise.reject(error);
  }
);
