'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoryService } from '@/services/category.service';
import type { CreateCategoryData, UpdateCategoryData } from '@/types';

export const CATEGORY_KEYS = {
  all:  ['categories'] as const,
  tree: ['categories', 'tree'] as const,
  list: (params?: object) => ['categories', 'list', params ?? {}] as const,
  detail: (id: string) => ['categories', 'detail', id] as const,
};

export function useCategoryTree() {
  return useQuery({
    queryKey: CATEGORY_KEYS.tree,
    queryFn: () => categoryService.getTree(),
    staleTime: 5 * 60_000,   // 5 min
    gcTime: 10 * 60_000,     // 10 min
  });
}

export function useCategories(params?: { page?: number; limit?: number; parentId?: string }) {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () => categoryService.getCategories(params),
    staleTime: 5 * 60_000,
  });
}

export function useCategoryById(id: string) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryService.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success('Tạo danh mục thành công');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Tạo danh mục thất bại');
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success('Cập nhật danh mục thành công');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success('Đã xóa danh mục');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Xóa thất bại');
    },
  });
}
