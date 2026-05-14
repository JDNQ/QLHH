import api from '@/lib/axios';
import type {
  Post,
  PaginatedData,
  PostsQuery,
  AdminPostsQuery,
  CreatePostData,
  UpdatePostData,
  UpdatePostStatusData,
} from '@/types';

export const postService = {
  // ── Public ──────────────────────────────────────────────────────────────────
  async getPosts(params: PostsQuery = {}): Promise<PaginatedData<Post>> {
    const res = await api.get('/posts', { params });
    return res.data.data;
  },

  async getPostById(id: string): Promise<Post> {
    const res = await api.get(`/posts/${id}`);
    return res.data.data;
  },

  async getPostBySlug(slug: string): Promise<Post> {
    const res = await api.get(`/posts/slug/${slug}`);
    return res.data.data;
  },

  // ── Authenticated ────────────────────────────────────────────────────────────
  async createPost(data: CreatePostData): Promise<Post> {
    const res = await api.post('/posts', data);
    return res.data.data;
  },

  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    const res = await api.patch(`/posts/${id}`, data);
    return res.data.data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async addImages(postId: string, urls: string[]): Promise<Post> {
    const res = await api.post(`/posts/${postId}/images`, { urls });
    return res.data.data;
  },

  async removeImage(imageId: string): Promise<void> {
    await api.delete(`/posts/images/${imageId}`);
  },

  // ── Admin ────────────────────────────────────────────────────────────────────
  async adminGetPosts(params: AdminPostsQuery = {}): Promise<PaginatedData<Post>> {
    const res = await api.get('/posts/admin/all', { params });
    return res.data.data;
  },

  async adminGetStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    featured: number;
  }> {
    const res = await api.get('/posts/admin/stats');
    return res.data.data;
  },

  async adminUpdateStatus(id: string, data: UpdatePostStatusData): Promise<Post> {
    const res = await api.patch(`/posts/admin/${id}/status`, data);
    return res.data.data;
  },
};
