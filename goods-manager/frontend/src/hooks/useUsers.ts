'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin.service';
import type { UsersQuery, CreateUserData, UpdateUserData } from '@/types';

export const USER_KEYS = {
  all:    ['users'] as const,
  list:   (params: UsersQuery) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsers(params: UsersQuery = {}) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => adminService.getUsers(params),
    staleTime: 30_000,
  });
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => adminService.getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) => adminService.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success('Tạo người dùng thành công');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Tạo thất bại'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      adminService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      qc.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
      toast.success('Cập nhật thành công');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Cập nhật thất bại'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success('Đã xóa người dùng');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Xóa thất bại'),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.toggleUserActive(id),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      qc.setQueryData(USER_KEYS.detail(user.id), user);
      toast.success(user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    },
    onError: (err: any) => toast.error(err?.message ?? 'Thao tác thất bại'),
  });
}
