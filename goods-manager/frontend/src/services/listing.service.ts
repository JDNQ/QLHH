import api from "@/lib/axios";
import type {
  CreateListingData,
  Listing,
  ListingImage,
  ListingsQuery,
  PaginatedResponse,
  UpdateListingData,
} from "@/types";

type ApiEnvelope<T> = { data?: T };
type PostsPage<T> = { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as ApiEnvelope<T>)?.data ?? (payload as T);
}

function postToListing(post: any): Listing {
  const firstCategory = post?.categories?.[0]?.category;
  const firstCategoryId = post?.categories?.[0]?.categoryId;
  const images = Array.isArray(post?.images) ? post.images : [];
  const mainImage = images.find((img: any) => img?.isMain) ?? images[0];
  const priceNumber =
    typeof post?.priceValue === "number"
      ? post.priceValue
      : Number(post?.price ?? 0) || 0;

  return {
    id: post?.id ?? "",
    title: post?.title ?? "",
    description: post?.content ?? "",
    price: priceNumber,
    isNegotiable: false,
    isUrgent: Boolean(post?.isFeatured),
    categoryId: firstCategoryId ?? "",
    category: firstCategory,
    images: images.map((img: any) => ({
      id: img?.id ?? "",
      url: img?.url ?? "",
      isThumbnail: Boolean(img?.isMain),
      order: 0,
    })),
    thumbnailUrl: post?.thumbnail ?? mainImage?.url,
    province: post?.location ?? "",
    district: "",
    address: "",
    phone: post?.user?.phone ?? "",
    allowMessage: true,
    showPhone: true,
    status: post?.status ?? "PENDING",
    rejectedReason: post?.rejectedReason,
    viewCount: post?.views ?? 0,
    userId: post?.userId ?? "",
    user: post?.user,
    createdAt: post?.createdAt ?? "",
    updatedAt: post?.updatedAt ?? "",
  };
}

function listingToPostPayload(data: CreateListingData | UpdateListingData) {
  return {
    title: data.title,
    content: data.description,
    price:
      data.price !== undefined && data.price !== null ? String(data.price) : undefined,
    location: [data.district, data.province].filter(Boolean).join(", "),
    categoryIds: data.categoryId ? [data.categoryId] : [],
  };
}

function normalizeListParams(params: ListingsQuery = {}) {
  const out: Record<string, unknown> = { ...params };
  if (params.categoryId || params.category) {
    out.categoryId = params.categoryId ?? params.category;
  }
  delete out.category;
  return out;
}

export const listingService = {
  async getListings(
    params: ListingsQuery = {},
  ): Promise<PaginatedResponse<Listing>> {
    const res = await api.get("/posts", { params: normalizeListParams(params) });
    const payload = unwrap<PostsPage<any>>(res.data);
    return {
      items: (payload?.data ?? []).map(postToListing),
      total: payload?.meta?.total ?? 0,
      page: payload?.meta?.page ?? 1,
      limit: payload?.meta?.limit ?? 12,
      totalPages: payload?.meta?.totalPages ?? 1,
    };
  },

  async getListingById(id: string): Promise<Listing> {
    const res = await api.get(`/posts/${id}`);
    return postToListing(unwrap<any>(res.data));
  },

  async getListingBySlug(slug: string): Promise<Listing> {
    const res = await api.get(`/posts/slug/${slug}`);
    return postToListing(unwrap<any>(res.data));
  },

  async createListing(data: CreateListingData): Promise<Listing> {
    const res = await api.post("/posts", listingToPostPayload(data));
    return postToListing(unwrap<any>(res.data));
  },

  async updateListing(id: string, data: UpdateListingData): Promise<Listing> {
    const res = await api.patch(`/posts/${id}`, listingToPostPayload(data));
    return postToListing(unwrap<any>(res.data));
  },

  async deleteListing(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async bumpListing(id: string): Promise<Listing> {
    // Backend currently has no bump route; return current record as a safe fallback.
    return this.getListingById(id);
  },

  async getMyListings(
    params: ListingsQuery = {},
  ): Promise<PaginatedResponse<Listing>> {
    const res = await api.get("/posts/my", { params: normalizeListParams(params) });
    const payload = unwrap<PostsPage<any>>(res.data);
    return {
      items: (payload?.data ?? []).map(postToListing),
      total: payload?.meta?.total ?? 0,
      page: payload?.meta?.page ?? 1,
      limit: payload?.meta?.limit ?? 12,
      totalPages: payload?.meta?.totalPages ?? 1,
    };
  },

  async getAdminListings(
    params: ListingsQuery = {},
  ): Promise<PaginatedResponse<Listing>> {
    const res = await api.get("/posts/admin/all", { params: normalizeListParams(params) });
    const payload = unwrap<PostsPage<any>>(res.data);
    return {
      items: (payload?.data ?? []).map(postToListing),
      total: payload?.meta?.total ?? 0,
      page: payload?.meta?.page ?? 1,
      limit: payload?.meta?.limit ?? 12,
      totalPages: payload?.meta?.totalPages ?? 1,
    };
  },

  async approveListing(id: string): Promise<Listing> {
    const res = await api.patch(`/posts/admin/${id}/status`, {
      status: "APPROVED",
    });
    return postToListing(unwrap<any>(res.data));
  },

  async rejectListing(id: string, _reason: string): Promise<Listing> {
    const res = await api.patch(`/posts/admin/${id}/status`, {
      status: "REJECTED",
    });
    return postToListing(unwrap<any>(res.data));
  },

  async viewListing(_id: string): Promise<void> {
    // No dedicated view route in backend at the moment.
  },

  async viewPhone(id: string): Promise<{ phone: string }> {
    const listing = await this.getListingById(id);
    return { phone: listing.phone ?? "" };
  },

  async uploadImages(
    listingId: string,
    files: File[],
  ): Promise<ListingImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const uploadRes = await api.post("/upload/images", formData);
    const uploadPayload = unwrap<{ urls?: string[] }>(uploadRes.data);
    const urls = Array.isArray(uploadPayload?.urls) ? uploadPayload.urls : [];

    const res = await api.post(`/posts/${listingId}/images`, { urls });
    const post = unwrap<any>(res.data);
    const images = Array.isArray(post?.images) ? post.images : [];
    return images.map((img: any) => ({
      id: img?.id ?? "",
      url: img?.url ?? "",
      isThumbnail: Boolean(img?.isMain),
      order: 0,
    }));
  },

  async deleteImage(_listingId: string, imageId: string): Promise<void> {
    await api.delete(`/posts/images/${imageId}`);
  },

  async setThumbnail(
    listingId: string,
    _imageId: string,
  ): Promise<ListingImage> {
    const listing = await this.getListingById(listingId);
    return (
      listing.images.find((img) => img.isThumbnail) ??
      listing.images[0] ?? { id: "", url: "", isThumbnail: false, order: 0 }
    );
  },
};
