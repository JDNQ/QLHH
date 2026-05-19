import api from '@/lib/axios';
import type {
  Category,
  PaginatedData,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types';

function unwrap<T>(payload: any): T {
  return payload?.data ?? payload;
}

function normalizePaginated<T>(payload: any): PaginatedData<T> {
  const data = unwrap<any>(payload);
  if (Array.isArray(data)) {
    return {
      data,
      meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 },
    };
  }
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

export const categoryService = {
  async getTree(): Promise<Category[]> {
    const res = await api.get('/categories/tree');
    const payload = unwrap<unknown>(res.data);
    return Array.isArray(payload) ? (payload as Category[]) : [];
  },

  async getCategories(params: { page?: number; limit?: number; parentId?: string } = {}): Promise<PaginatedData<Category>> {
    const res = await api.get('/categories', { params });
    return normalizePaginated<Category>(res.data);
  },

  async getCategoryById(id: string): Promise<Category> {
    const res = await api.get(`/categories/${id}`);
    return res.data.data;
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const res = await api.post('/categories', data);
    return unwrap<Category>(res.data);
  },

  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const res = await api.patch(`/categories/${id}`, data);
    return unwrap<Category>(res.data);
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
