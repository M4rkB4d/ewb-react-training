// src/lib/api-client.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from './env';
import { useAuthStore } from '@/stores/auth-store';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies (refresh token)
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // BSP 1019 — Request correlation ID for audit trail
    config.headers['X-Request-ID'] = crypto.randomUUID();
    config.headers['X-Timestamp'] = new Date().toISOString();

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // 401 — Token expired, attempt refresh
    if (status === 401 && originalRequest != null && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${env.VITE_API_BASE_URL}/auth/refresh`,
          null,
          { withCredentials: true },
        );

        useAuthStore.getState().setAuth(data.user, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // 403 — Insufficient permissions
    if (status === 403) {
      console.error('[API] Forbidden:', originalRequest?.url);
    }

    // 429 — Rate limited
    if (status === 429) {
      console.warn('[API] Rate limited:', originalRequest?.url);
    }

    return Promise.reject(error);
  },
);

// BSP 1019 — Structured request/response logging
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.info('[API]', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
);
