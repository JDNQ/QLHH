import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { parentId?: string }) {
    const { page = 1, limit = 20, search, parentId } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (search) where.name = { contains: search };
    if (parentId !== undefined) {
      // Handle parentId=null string from query params
      where.parentId = parentId === 'null' || parentId === '' ? null : parentId;
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { children: true } } },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTree() {
    const allCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const buildTree = (parentId: string | null): any[] => {
      return allCategories
        .filter((c) => c.parentId === parentId)
        .map((c) => ({ ...c, children: buildTree(c.id) }));
    };

    return buildTree(null);
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Unset parentId for children before deleting
    await this.prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Xóa danh mục thành công' };
  }
}
