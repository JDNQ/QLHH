"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { User, LoginData, RegisterData } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;

  // internal helpers
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      setLoading: (isLoading) => set({ isLoading }),

      login: async (data) => {
        set({ isLoading: true });
        try {
          const { default: api } = await import("@/lib/axios");
          const res = await api.post("/auth/login", data);

          // Spec: { user, token }
          const { user, token } = res.data.data as {
            user: User;
            token: string;
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);

            // Sync for middleware.ts (reads accessToken cookie)
            document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=86400`;
          }

          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { default: api } = await import("@/lib/axios");
          const res = await api.post("/auth/register", data);

          // Spec: { user, token }
          const { user, token } = res.data.data as {
            user: User;
            token: string;
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);

            // Sync for middleware.ts (reads accessToken cookie)
            document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=86400`;
          }

          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      fetchMe: async () => {
        const token =
          get().token ??
          (typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null);
        if (!token) return;

        set({ isLoading: true });
        try {
          const { default: api } = await import("@/lib/axios");
          const res = await api.get("/auth/me");
          set({
            user: res.data.data as User,
            isAuthenticated: true,
            isLoading: false,
          });

          if (typeof window !== "undefined") {
            // Sync for middleware.ts (reads accessToken cookie)
            const currentToken = localStorage.getItem("token");
            if (currentToken) {
              document.cookie = `accessToken=${encodeURIComponent(currentToken)}; path=/; max-age=86400`;
            }
          }
        } catch {
          // invalid token
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
        }
      },

      logout: () => {
        const { token } = get();

        // Fire and forget logout API call
        if (token && typeof window !== "undefined") {
          import("@/lib/axios")
            .then(({ default: api }) =>
              api.post("/auth/logout", { token }).catch(() => {}),
            )
            .finally(() => {});
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          // Remove cookie for middleware.ts
          document.cookie = "accessToken=; path=/; max-age=0";
          window.location.href = "/auth/login";
        }

        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage,
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Listen for programmatic logout events from axios interceptor
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });
}
