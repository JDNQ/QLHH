'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postService } from '@/services/post.service';
import type {
  PostsQuery,
  AdminPostsQuery,
  CreatePostData,
  UpdatePostData,
  UpdatePostStatusData,
} from '@/types';

export const POST_KEYS = {
  all:        ['posts'] as const,
  list:       (params: PostsQuery) => ['posts', 'list', params] as const,
  detail:     (id: string) => ['posts', 'detail', id] as const,
  slug:       (slug: string) => ['posts', 'slug', slug] as const,
  adminAll:   (params: AdminPostsQuery) => ['posts', 'admin', params] as const,
  adminStats: ['posts', 'admin', 'stats'] as const,
};

// ── Public queries ────────────────────────────────────────────────────────────
export function usePosts(params: PostsQuery = {}) {
  return useQuery({
    queryKey: POST_KEYS.list(params),
    queryFn: () => postService.getPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePostDetail(id: string) {
  return useQuery({
    queryKey: POST_KEYS.detail(id),
    queryFn: () => postService.getPostById(id),
    enabled: !!id,
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: POST_KEYS.slug(slug),
    queryFn: () => postService.getPostBySlug(slug),
    enabled: !!slug,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostData) => postService.createPost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
      toast.success('Đăng tin thành công, đang chờ duyệt');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Đăng tin thất bại');
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData }) =>
      postService.updatePost(id, data),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
      qc.invalidateQueries({ queryKey: POST_KEYS.detail(post.id) });
      toast.success('Cập nhật thành công');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
      toast.success('Đã xóa bài viết');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Xóa thất bại');
    },
  });
}

export function useAddImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, urls }: { postId: string; urls: string[] }) =>
      postService.addImages(postId, urls),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: POST_KEYS.detail(post.id) });
    },
  });
}

export function useRemoveImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId }: { imageId: string }) =>
      postService.removeImage(imageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
    },
  });
}

// ── Admin queries ─────────────────────────────────────────────────────────────
export function useAdminPosts(params: AdminPostsQuery = {}) {
  return useQuery({
    queryKey: POST_KEYS.adminAll(params),
    queryFn: () => postService.adminGetPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: POST_KEYS.adminStats,
    queryFn: () => postService.adminGetStats(),
    staleTime: 60_000,
  });
}

export function useAdminUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostStatusData }) =>
      postService.adminUpdateStatus(id, data),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
      qc.invalidateQueries({ queryKey: POST_KEYS.detail(post.id) });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    },
  });
}
