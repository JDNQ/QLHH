import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PostStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { UpdatePostStatusDto } from "./dto/update-post-status.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import slugify from "slugify";

const POST_INCLUDE = {
  user: {
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  },
  categories: { include: { category: true } },
  images: { orderBy: { isMain: "desc" as const } },
};

export class PostsQueryDto extends PaginationDto {
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  isFeatured?: string;
}

export class AdminPostsQueryDto extends PaginationDto {
  status?: PostStatus;
  userId?: string;
}

export class MyPostsQueryDto extends PaginationDto {
  status?: PostStatus;
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PostsQueryDto) {
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      location,
      minPrice,
      maxPrice,
      isFeatured,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: PostStatus.APPROVED };

    if (search) where.title = { contains: search };
    if (location) where.location = { contains: location };
    if (categoryId) where.categories = { some: { categoryId } };

    if (isFeatured === "true" || isFeatured === "1") {
      where.isFeatured = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceValue = {};
      if (minPrice !== undefined) where.priceValue.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.priceValue.lte = parseFloat(maxPrice);
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: POST_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: POST_INCLUDE,
    });
    if (!post || post.status !== PostStatus.APPROVED) {
      throw new NotFoundException("Bài đăng không tồn tại");
    }

    await this.prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
    return { ...post, views: post.views + 1 };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });
    if (!post) throw new NotFoundException("Bài đăng không tồn tại");
    return post;
  }

  async create(userId: string, dto: CreatePostDto) {
    const { categoryIds, price, ...data } = dto;
    const slug = await this.generateUniqueSlug(dto.title);
    const priceValue = price ? parseFloat(price) : null;

    const post = await this.prisma.post.create({
      data: {
        ...data,
        price,
        priceValue: isNaN(priceValue) ? null : priceValue,
        slug,
        userId,
        categories: categoryIds?.length
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      } as any,
      include: POST_INCLUDE,
    });

    return post;
  }

  async findMine(userId: string, query: MyPostsQueryDto) {
    const { page = 1, limit = 12, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (search) where.title = { contains: search };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: POST_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, userId: string, role: Role, dto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (post.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("Bạn không có quyền sửa bài đăng này");
    }

    const { categoryIds, price, ...data } = dto;
    const priceValue =
      price !== undefined ? parseFloat(price) || null : undefined;

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(price !== undefined && { price }),
        ...(priceValue !== undefined && { priceValue }),
        // Reset to PENDING when user edits (only if not admin)
        ...(role !== Role.ADMIN && { status: PostStatus.PENDING }),
        ...(categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: POST_INCLUDE,
    });

    return updatedPost;
  }

  async remove(id: string, userId: string, role: Role) {
    const post = await this.findOne(id);

    if (post.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("Bạn không có quyền xóa bài đăng này");
    }

    await this.prisma.post.delete({ where: { id } });
    return { message: "Xóa bài đăng thành công" };
  }

  async addImages(postId: string, userId: string, role: Role, urls: string[]) {
    const post = await this.findOne(postId);

    // Normalize input to avoid 500 when client sends unexpected body (e.g. urls undefined)
    const safeUrls = Array.isArray(urls) ? urls : [];

    if (post.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException(
        "Bạn không có quyền thêm ảnh vào bài đăng này",
      );
    }

    const existingImagesCount = await this.prisma.postImage.count({
      where: { postId },
    });

    await this.prisma.postImage.createMany({
      data: safeUrls.map((url, index) => ({
        postId,
        url,
        isMain: existingImagesCount === 0 && index === 0,
      })),
    });

    return this.findOne(postId);
  }

  async removeImage(imageId: string, userId: string, role: Role) {
    const image = await this.prisma.postImage.findUnique({
      where: { id: imageId },
      include: { post: true },
    });

    if (!image) throw new NotFoundException("Ảnh không tồn tại");

    if (image.post.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("Bạn không có quyền xóa ảnh này");
    }

    await this.prisma.postImage.delete({ where: { id: imageId } });
    return { message: "Xóa ảnh thành công" };
  }

  // Admin methods
  async adminFindAll(query: AdminPostsQueryDto) {
    const { page = 1, limit = 12, search, status, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.title = { contains: search };
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: POST_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminUpdateStatus(id: string, dto: UpdatePostStatusDto) {
    await this.findOne(id);
    return this.prisma.post.update({
      where: { id },
      data: dto as any,
      include: POST_INCLUDE,
    });
  }

  async adminStats() {
    const [total, pending, approved, rejected, expired, featured] =
      await Promise.all([
        this.prisma.post.count(),
        this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
        this.prisma.post.count({ where: { status: PostStatus.APPROVED } }),
        this.prisma.post.count({ where: { status: PostStatus.REJECTED } }),
        this.prisma.post.count({ where: { status: "EXPIRED" as any } }),
        this.prisma.post.count({ where: { isFeatured: true } }),
      ]);

    return { total, pending, approved, rejected, expired, featured };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true, locale: "vi" });
    if (!slug) slug = `post-${Date.now()}`;

    const existing = await this.prisma.post.findUnique({ where: { slug } });
    if (!existing) return slug;

    return `${slug}-${Date.now()}`;
  }
}
