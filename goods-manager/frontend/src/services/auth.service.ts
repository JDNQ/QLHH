import api from "@/lib/axios";
import { parseAuthTokens } from "@/lib/authResponse";
import type { LoginData, RegisterData, User, AuthTokens } from "@/types";

export const authService = {
  async login(
    emailOrData: string | LoginData,
    password?: string,
  ): Promise<AuthTokens> {
    const data =
      typeof emailOrData === "string"
        ? { email: emailOrData, password: password ?? "" }
        : emailOrData;
    const res = await api.post("/auth/login", data);
    return parseAuthTokens(res.data);
  },

  async register(data: RegisterData): Promise<AuthTokens> {
    const res = await api.post("/auth/register", data);
    return parseAuthTokens(res.data);
  },

  async getMe(): Promise<User> {
    const res = await api.get("/auth/me");
    return res.data.data;
  },

  async logout(refreshToken?: string): Promise<void> {
    await api.post("/auth/logout", refreshToken ? { refreshToken } : {});
  },

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await api.post("/auth/refresh", { refreshToken });
    return res.data?.data ?? res.data;
  },
};
