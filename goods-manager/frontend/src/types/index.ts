export type Role = "user" | "admin" | "USER" | "ADMIN";
export type UserStatus = "active" | "banned" | "unverified";
export type ListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  status?: UserStatus;
  isActive?: boolean;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  order?: number;
  sortOrder?: number;
  isVisible?: boolean;
  isActive?: boolean;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: { children: number };
}

export interface ListingImage {
  id: string;
  url: string;
  isThumbnail: boolean;
  order: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  isUrgent: boolean;
  categoryId: string;
  category?: Category;
  images: ListingImage[];
  thumbnailUrl?: string;
  province: string;
  district: string;
  address?: string;
  phone: string;
  allowMessage: boolean;
  showPhone: boolean;
  status: ListingStatus;
  rejectedReason?: string;
  viewCount: number;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
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

export interface AuthTokens {
  token: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface ListingsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: string;
  status?: ListingStatus | string;
  sort?: "newest" | "price_asc" | "price_desc" | string;
  province?: string;
  district?: string;
  location?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export interface CreateListingData {
  title: string;
  categoryId: string;
  price: number;
  isNegotiable?: boolean;
  isUrgent?: boolean;
  description: string;
  province: string;
  district: string;
  address?: string;
  phone: string;
  allowMessage?: boolean;
  showPhone?: boolean;
  status?: ListingStatus;
}

export type UpdateListingData = Partial<CreateListingData> & {
  rejectedReason?: string;
};

export type UploadedListingImage = ListingImage;

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus | string;
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  order?: number;
  sortOrder?: number;
  isVisible?: boolean;
  isActive?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  role?: Role;
  status?: UserStatus;
}

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

// Compatibility layer for existing UI while services move to /listings.
export type PostStatus = ListingStatus;
export interface PostImage {
  id: string;
  postId?: string;
  url: string;
  isMain: boolean;
  createdAt?: string;
}
export interface PostCategory {
  postId?: string;
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

export type PostsQuery = ListingsQuery;
export interface AdminPostsQuery extends ListingsQuery {
  userId?: string;
}
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

export interface UploadImageResponse {
  url: string;
}
export interface UploadImagesResponse {
  urls: string[];
}
