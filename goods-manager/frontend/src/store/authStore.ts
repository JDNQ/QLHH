"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { parseAuthTokens } from "@/lib/authResponse";
import type { User, LoginData, RegisterData } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;

  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
}

function setMiddlewareCookies(params: { token: string; user: User }) {
  const { token, user } = params;

  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=86400`;

  const authStoragePayload = {
    state: {
      accessToken: token,
      user,
    },
  };

  document.cookie = `auth-storage=${encodeURIComponent(
    JSON.stringify(authStoragePayload),
  )}; path=/; max-age=86400`;
}

function clearMiddlewareCookies() {
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "auth-storage=; path=/; max-age=0";
}

function clearClientAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  clearMiddlewareCookies();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
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
          const { user, accessToken, refreshToken } = parseAuthTokens(res.data);

          if (typeof window !== "undefined") {
            localStorage.setItem("token", accessToken);
            if (refreshToken) {
              localStorage.setItem("refreshToken", refreshToken);
            }
            setMiddlewareCookies({ token: accessToken, user });
          }

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
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
          const { user, accessToken, refreshToken } = parseAuthTokens(res.data);

          if (typeof window !== "undefined") {
            localStorage.setItem("token", accessToken);
            if (refreshToken) {
              localStorage.setItem("refreshToken", refreshToken);
            }
            setMiddlewareCookies({ token: accessToken, user });
          }

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
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
          const me = res.data.data as User;

          set({ user: me, token, isAuthenticated: true, isLoading: false });

          if (typeof window !== "undefined") {
            const currentToken = localStorage.getItem("token") ?? token;
            setMiddlewareCookies({ token: currentToken, user: me });
          }
        } catch {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          if (typeof window !== "undefined") {
            clearClientAuth();
          }
        }
      },

      logout: () => {
        const refreshToken =
          get().refreshToken ??
          (typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null);

        if (refreshToken && typeof window !== "undefined") {
          import("@/lib/axios")
            .then(({ default: api }) =>
              api.post("/auth/logout", { refreshToken }).catch(() => {}),
            )
            .finally(() => {});
        }

        if (typeof window !== "undefined") {
          clearClientAuth();
          window.location.href = "/auth/login";
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
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
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });
}
