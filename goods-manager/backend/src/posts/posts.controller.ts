import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PostsService, PostsQueryDto, AdminPostsQueryDto } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class AddImagesDto {
  urls: string[];
}

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  // Admin routes (must be before :id param routes)
  @Get('admin/all')
  @Roles(Role.ADMIN)
  adminFindAll(@Query() query: AdminPostsQueryDto) {
    return this.postsService.adminFindAll(query);
  }

  @Get('admin/stats')
  @Roles(Role.ADMIN)
  adminStats() {
    return this.postsService.adminStats();
  }

  @Patch('admin/:id/status')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  adminUpdateStatus(@Param('id') id: string, @Body() dto: UpdatePostStatusDto) {
    return this.postsService.adminUpdateStatus(id, dto);
  }

  // Public routes
  @Public()
  @Get()
  findAll(@Query() query: PostsQueryDto) {
    return this.postsService.findAll(query);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  // Authenticated routes
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.remove(id, user.id, user.role);
  }

  @Post(':id/images')
  addImages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: AddImagesDto,
  ) {
    return this.postsService.addImages(id, user.id, user.role, dto.urls);
  }

  @Delete('images/:imageId')
  @HttpCode(HttpStatus.OK)
  removeImage(@Param('imageId') imageId: string, @CurrentUser() user: any) {
    return this.postsService.removeImage(imageId, user.id, user.role);
  }
}
