"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { postService } from "@/services/post.service";
import type {
  AdminPostsQuery,
  CreatePostData,
  PostsQuery,
  UpdatePostData,
  UpdatePostStatusData,
} from "@/types";

export const POST_KEYS = {
  all: ["posts"] as const,
  list: (params: PostsQuery) => ["posts", "list", params] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
  slug: (slug: string) => ["posts", "slug", slug] as const,
  mine: (params: AdminPostsQuery) => ["posts", "mine", params] as const,
  adminAll: (params: AdminPostsQuery) => ["posts", "admin", params] as const,
  adminStats: ["posts", "admin", "stats"] as const,
};

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

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postService.createPost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
      toast.success("Dang tin thanh cong, dang cho duyet");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Dang tin that bai");
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
      toast.success("Cap nhat thanh cong");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Cap nhat that bai");
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all });
      toast.success("Da xoa bai viet");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Xoa that bai");
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

export function useMyPosts(
  params: AdminPostsQuery = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: POST_KEYS.mine(params),
    queryFn: () => postService.getMyPosts(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useAdminPosts(
  params: AdminPostsQuery = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: POST_KEYS.adminAll(params),
    queryFn: () => postService.adminGetPosts(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useAdminStats(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: POST_KEYS.adminStats,
    queryFn: () => postService.adminGetStats(),
    enabled: options.enabled ?? true,
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
      toast.error(err?.message ?? "Cap nhat that bai");
    },
  });
}
