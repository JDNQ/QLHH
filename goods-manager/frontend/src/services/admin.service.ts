import api from '@/lib/axios';
import type {
  User,
  PaginatedData,
  UsersQuery,
  CreateUserData,
  UpdateUserData,
} from '@/types';

export const adminService = {
  // ── Users ────────────────────────────────────────────────────────────────────
  async getUsers(params: UsersQuery = {}): Promise<PaginatedData<User>> {
    const res = await api.get('/users', { params });
    return res.data.data;
  },

  async getUserById(id: string): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const res = await api.post('/users', data);
    return res.data.data;
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const res = await api.patch(`/users/${id}`, data);
    return res.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async toggleUserActive(id: string): Promise<User> {
    const res = await api.patch(`/users/${id}/toggle-active`);
    return res.data.data;
  },
};
