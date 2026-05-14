// ─── Enums ───────────────────────────────────────────────────────────────────
export type Role = "ADMIN" | "USER";
export type PostStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

// ─── Core Entities ───────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { children: number };
}

export interface PostImage {
  id: string;
  postId: string;
  url: string;
  isMain: boolean;
  createdAt: string;
}

export interface PostCategory {
  postId: string;
  categoryId: string;
  category: Category;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  price?: string;
  priceValue?: number;
  priceUnit?: string;
  location?: string;
  status: PostStatus;
  isFeatured: boolean;
  views: number;

  userId: string;
  user: Pick<User, "id" | "name" | "email" | "phone" | "avatar">;

  categories: PostCategory[];
  images: PostImage[];

  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

// ─── Post Forms ───────────────────────────────────────────────────────────────
export interface CreatePostData {
  title: string;
  content: string;
  thumbnail?: string;
  price?: string;
  priceUnit?: string;
  location?: string;
  categoryIds?: string[];
}

export type UpdatePostData = Partial<CreatePostData>;

export interface UpdatePostStatusData {
  status?: PostStatus;
  isFeatured?: boolean;
}

// ─── Category Forms ────────────────────────────────────────────────────────────
export interface CreateCategoryData {
  name: string;
  icon?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

// ─── User Forms ────────────────────────────────────────────────────────────────
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  address?: string;
  role?: Role;
  isActive?: boolean;
}

// ─── Pagination & Query ───────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  isFeatured?: string;
}

export interface AdminPostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PostStatus;
  userId?: string;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export interface UploadImageResponse {
  url: string;
}

export interface UploadImagesResponse {
  urls: string[];
}
