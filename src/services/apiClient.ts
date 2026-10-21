/**
 * Admin API Client
 * ────────────────
 * Axios instance configured for the real backend.
 * Uses adminAccessToken (separate from user accessToken).
 * Includes JWT interceptor and error handling.
 */

import axios from "axios";

/**
 * Normalize backend origin.
 * HTTPS admin pages must never call http:// APIs (browser mixed-content block).
 * Upgrade http→https when the page is secure, or when the host is a Vercel deploy.
 */
function resolveBackendUrl(): string {
  let url = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001").trim();
  if (url.endsWith("/")) url = url.slice(0, -1);

  const isBrowserHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const isRemoteHttp =
    url.startsWith("http://") && !/localhost|127\.0\.0\.1/i.test(url);

  if (url.startsWith("http://") && (isBrowserHttps || isRemoteHttp)) {
    url = `https://${url.slice("http://".length)}`;
  }

  return url;
}

const BACKEND_URL = resolveBackendUrl();

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
