'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useCreatePost, useAddImages } from '@/hooks/usePosts';
import { useCategoryTree } from '@/hooks/useCategories';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ImageUploader, UploadedImage } from '@/components/upload/ImageUploader';
import toast from 'react-hot-toast';

const PRICE_UNITS = [
  { value: 'VNĐ', label: 'VNĐ' },
  { value: 'USD', label: 'USD' },
  { value: 'triệu', label: 'Triệu đồng' },
];

const postSchema = z.object({
  title: z.string().min(10, 'Tiêu đề tối thiểu 10 ký tự').max(100, 'Tối đa 100 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.string().optional(),
  priceUnit: z.string().optional(),
  location: z.string().optional(),
  content: z.string().min(20, 'Mô tả tối thiểu 20 ký tự'),
});

type PostForm = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const createPost = useCreatePost();
  const addImages = useAddImages();
  const { data: categories = [] } = useCategoryTree();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: { priceUnit: 'VNĐ' },
  });

  const onSubmit = async (data: PostForm) => {
    const uploadedImages = images.filter((img) => img.url && !img.uploading && !img.error);
    const thumbnailUrl = uploadedImages.find((img) => img.isMain)?.url ?? uploadedImages[0]?.url;

    try {
      const post = await createPost.mutateAsync({
        title: data.title,
        content: data.content,
        price: data.price || undefined,
        priceUnit: data.priceUnit || undefined,
        location: data.location || undefined,
        categoryIds: data.categoryId ? [data.categoryId] : undefined,
        thumbnail: thumbnailUrl,
      });

      // Attach images
      if (uploadedImages.length > 0) {
        await addImages.mutateAsync({
          postId: post.id,
          urls: uploadedImages.map((img) => img.url),
        });
      }

      toast.success('Đăng tin thành công! Bài đăng đang chờ duyệt.');
      router.push('/dashboard/posts');
    } catch (err: any) {
      toast.error(err?.message ?? 'Đăng tin thất bại');
    }
  };

  const isUploading = images.some((img) => img.uploading);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/posts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Đăng tin mới</h1>
          <p className="text-sm text-neutral-500">Bài đăng sẽ được duyệt trước khi hiển thị</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <Section title="Thông tin cơ bản">
          <Input
            label="Tiêu đề"
            placeholder="VD: Bán xe máy Honda Wave 2020, ít đi, còn mới..."
            error={errors.title?.message}
            required
            {...register('title')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Danh mục"
              options={categoryOptions}
              placeholder="Chọn danh mục..."
              error={errors.categoryId?.message}
              required
              {...register('categoryId')}
            />
            <Input
              label="Địa điểm"
              placeholder="VD: Quận 1, TP.HCM"
              {...register('location')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá bán"
              placeholder="VD: 5000000"
              type="number"
              min="0"
              hint="Để trống nếu thỏa thuận"
              {...register('price')}
            />
            <Select
              label="Đơn vị"
              options={PRICE_UNITS}
              {...register('priceUnit')}
            />
          </div>
        </Section>

        {/* Description */}
        <Section title="Mô tả chi tiết">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Mô tả chi tiết sản phẩm, tình trạng, lý do bán..."
                error={errors.content?.message}
                required
              />
            )}
          />
        </Section>

        {/* Images */}
        <Section title={`Hình ảnh (${images.filter((i) => i.url).length}/10)`}>
          <ImageUploader images={images} onChange={setImages} />
        </Section>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/posts">
            <Button variant="secondary">Hủy</Button>
          </Link>
          <Button
            type="submit"
            isLoading={isSubmitting || createPost.isPending}
            disabled={isUploading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isUploading ? 'Đang upload ảnh...' : 'Đăng tin'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-card p-5 space-y-4">
      <h2 className="text-sm font-semibold text-neutral-800 border-b border-neutral-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}
