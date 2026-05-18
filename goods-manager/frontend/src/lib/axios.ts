"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") return config;

    // Source token from zustand store to avoid mismatched keys/state.
    // (authStore persists `token` as part of auth-storage.)
    const token = (() => {
      try {
        const raw = localStorage.getItem("auth-storage");
        if (!raw) return localStorage.getItem("token");
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? localStorage.getItem("token");
      } catch {
        return localStorage.getItem("token");
      }
    })();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: error handling ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: unknown; errors?: unknown }>) => {
    const status = error.response?.status;
    const apiData = error.response?.data;
    const message =
      typeof apiData?.message === "string" ? apiData.message : undefined;

    const errorsFromApi: Record<string, string[]> = (() => {
      const raw = apiData?.errors;
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      // Backend hiện tại có thể không trả đúng format { field: string[] },
      // nên fallback an toàn nếu value không phải string[]
      const entries = Object.entries(raw as Record<string, unknown>);
      const out: Record<string, string[]> = {};
      for (const [key, value] of entries) {
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
          out[key] = value as string[];
        }
      }
      return out;
    })();

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        window.dispatchEvent(new CustomEvent("auth:logout"));

        if (!window.location.pathname.startsWith("/auth")) {
          toast.error("Phiên đăng nhập hết hạn");
          window.location.href = "/auth/login";
        }
      }

      return Promise.reject({
        message: "Phiên đăng nhập hết hạn",
        status: 401,
      });
    }

    if (status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return Promise.reject({ message: "Không có quyền", status: 403 });
    }

    if (status === 422) {
      // Backend hiện tại đang trả message string + không có errors object theo field
      return Promise.reject({
        message: message ?? "Dữ liệu không hợp lệ",
        errors: errorsFromApi,
        status: 422,
      });
    }

    if (status === 500) {
      toast.error("Lỗi server, vui lòng thử lại");
      return Promise.reject({ message: "Lỗi server", status: 500 });
    }

    return Promise.reject({
      message: message ?? "Có lỗi xảy ra",
      errors: errorsFromApi,
      status,
    });
  },
);

export default api;
