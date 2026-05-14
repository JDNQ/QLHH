import api from '@/lib/axios';
import type { LoginData, RegisterData, User, AuthTokens } from '@/types';

export const authService = {
  async login(data: LoginData): Promise<AuthTokens> {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },

  async register(data: RegisterData): Promise<AuthTokens> {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data.data;
  },
};
