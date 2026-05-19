import api from '@/lib/axios';
import type {
  User,
  PaginatedData,
  UsersQuery,
  CreateUserData,
  UpdateUserData,
} from '@/types';

function unwrap<T>(payload: any): T {
  return payload?.data ?? payload;
}

function normalizePaginated<T>(payload: any): PaginatedData<T> {
  const data = unwrap<any>(payload);
  if (Array.isArray(data?.items)) {
    return {
      data: data.items,
      meta: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      },
    };
  }
  return data;
}

export const adminService = {
  // ── Users ────────────────────────────────────────────────────────────────────
  async getUsers(params: UsersQuery = {}): Promise<PaginatedData<User>> {
    const res = await api.get('/admin/users', { params });
    return normalizePaginated<User>(res.data);
  },

  async getUserById(id: string): Promise<User> {
    const res = await api.get(`/admin/users/${id}`);
    return unwrap<User>(res.data);
  },

  async createUser(data: CreateUserData): Promise<User> {
    const res = await api.post('/admin/users', data);
    return unwrap<User>(res.data);
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const res = await api.put(`/admin/users/${id}`, data);
    return unwrap<User>(res.data);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async toggleUserActive(id: string): Promise<User> {
    try {
      const res = await api.put(`/admin/users/${id}/ban`);
      return unwrap<User>(res.data);
    } catch {
      const res = await api.put(`/admin/users/${id}/unban`);
      return unwrap<User>(res.data);
    }
  },
};
