import { listingService } from "@/services/listing.service";
import type {
  AdminPostsQuery,
  CreatePostData,
  Listing,
  PaginatedData,
  PaginatedResponse,
  Post,
  UpdatePostData,
  UpdatePostStatusData,
} from "@/types";

function slugFallback(listing: Listing) {
  return listing.id;
}

export function listingToPost(listing: Listing): Post {
  const category = listing.category;

  return {
    id: listing.id,
    title: listing.title,
    slug: slugFallback(listing),
    content: listing.description,
    thumbnail: listing.thumbnailUrl,
    price: String(listing.price ?? ""),
    priceValue: listing.price,
    location: [listing.district, listing.province].filter(Boolean).join(", "),
    status: listing.status,
    isFeatured: listing.isUrgent,
    views: listing.viewCount,
    userId: listing.userId,
    user: listing.user,
    categories: category
      ? [{ categoryId: category.id, category }]
      : listing.categoryId
        ? [{ categoryId: listing.categoryId, category: { id: listing.categoryId, name: "Danh muc" } }]
        : [],
    images: (listing.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      isMain: image.isThumbnail,
    })),
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

function toPaginatedData(
  response: PaginatedResponse<Listing>,
): PaginatedData<Post> {
  return {
    data: response.items.map(listingToPost),
    meta: {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
    },
  };
}

function postDataToListingData(data: CreatePostData | UpdatePostData) {
  return {
    title: data.title ?? "",
    description: data.content ?? "",
    price: Number(data.price ?? 0),
    categoryId: data.categoryIds?.[0] ?? "",
    province: data.location ?? "",
    district: data.location ?? "",
    phone: "",
    allowMessage: true,
    showPhone: true,
    status: "pending" as const,
  };
}

export const postService = {
  async getPosts(params: AdminPostsQuery = {}): Promise<PaginatedData<Post>> {
    const res = await listingService.getListings({
      ...params,
      category: params.category ?? params.categoryId,
    });
    return toPaginatedData(res);
  },

  async getPostById(id: string): Promise<Post> {
    return listingToPost(await listingService.getListingById(id));
  },

  async getPostBySlug(slug: string): Promise<Post> {
    return listingToPost(await listingService.getListingBySlug(slug));
  },

  async createPost(data: CreatePostData): Promise<Post> {
    return listingToPost(await listingService.createListing(postDataToListingData(data)));
  },

  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    return listingToPost(await listingService.updateListing(id, postDataToListingData(data)));
  },

  async deletePost(id: string): Promise<void> {
    await listingService.deleteListing(id);
  },

  async getMyPosts(params: AdminPostsQuery = {}): Promise<PaginatedData<Post>> {
    return toPaginatedData(await listingService.getMyListings(params));
  },

  async addImages(postId: string, urls: string[]): Promise<Post> {
    // Images are uploaded by upload.service in the new API flow.
    return this.getPostById(postId);
  },

  async removeImage(imageId: string): Promise<void> {
    // TODO: connect API once listingId is available at call site.
  },

  async adminGetPosts(params: AdminPostsQuery = {}): Promise<PaginatedData<Post>> {
    return toPaginatedData(await listingService.getAdminListings(params));
  },

  async adminGetStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    featured: number;
  }> {
    const res = await (await import("@/lib/axios")).default.get("/posts/admin/stats");
    return res.data.data;
  },

  async adminUpdateStatus(
    id: string,
    data: UpdatePostStatusData,
  ): Promise<Post> {
    if (data.status === "approved") {
      return listingToPost(await listingService.approveListing(id));
    }
    if (data.status === "rejected") {
      return listingToPost(
        await listingService.rejectListing(id, "Khong dat yeu cau"),
      );
    }
    return this.getPostById(id);
  },
};
