import api from '@/lib/axios';
import type {
  Category,
  PaginatedData,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types';

export const categoryService = {
  async getTree(): Promise<Category[]> {
    const res = await api.get('/categories/tree');
    return res.data.data;
  },

  async getCategories(params: { page?: number; limit?: number; parentId?: string } = {}): Promise<PaginatedData<Category>> {
    const res = await api.get('/categories', { params });
    return res.data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const res = await api.get(`/categories/${id}`);
    return res.data.data;
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const res = await api.post('/categories', data);
    return res.data.data;
  },

  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const res = await api.patch(`/categories/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
