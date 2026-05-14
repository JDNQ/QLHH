"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const isAdmin = store.user?.role === "ADMIN";

  const requireAuth = () => {
    if (!store.isAuthenticated) {
      router.push("/auth/login");
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!store.isAuthenticated) {
      router.push("/auth/login");
      return false;
    }
    if (!isAdmin) {
      router.push("/");
      return false;
    }
    return true;
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isAdmin,
    login: store.login,
    register: store.register,
    logout: store.logout,
    fetchMe: store.fetchMe,
    setUser: store.setUser,
    requireAuth,
    requireAdmin,
  };
}
