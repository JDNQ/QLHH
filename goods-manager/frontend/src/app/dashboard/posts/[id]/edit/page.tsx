'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { usePostDetail, useUpdatePost, useAddImages, useRemoveImage } from '@/hooks/usePosts';
import { useCategoryTree } from '@/hooks/useCategories';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ImageUploader, UploadedImage } from '@/components/upload/ImageUploader';
import { PageSpinner } from '@/components/ui/Spinner';
import { postService } from '@/services/post.service';
import toast from 'react-hot-toast';

const PRICE_UNITS = [
  { value: 'VNĐ', label: 'VNĐ' },
  { value: 'USD', label: 'USD' },
  { value: 'triệu', label: 'Triệu đồng' },
];

const postSchema = z.object({
  title: z.string().min(10, 'Tối thiểu 10 ký tự').max(100, 'Tối đa 100 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.string().optional(),
  priceUnit: z.string().optional(),
  location: z.string().optional(),
  content: z.string().min(20, 'Tối thiểu 20 ký tự'),
});

type PostForm = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: post, isLoading } = usePostDetail(id);
  const { data: categories = [] } = useCategoryTree();
  const updatePost = useUpdatePost();
  const addImages = useAddImages();
  const removeImage = useRemoveImage();
  const [images, setImages] = useState<UploadedImage[]>([]);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        categoryId: post.categories[0]?.categoryId ?? '',
        price: post.price ?? '',
        priceUnit: post.priceUnit ?? 'VNĐ',
        location: post.location ?? '',
        content: post.content,
      });
      setImages(
        post.images.map((img) => ({
          id: img.id,
          url: img.url,
          isMain: img.isMain,
        }))
      );
    }
  }, [post, reset]);

  const onSubmit = async (data: PostForm) => {
    const uploadedImages = images.filter((img) => img.url && !img.uploading && !img.error);
    const thumbnailUrl = uploadedImages.find((img) => img.isMain)?.url ?? uploadedImages[0]?.url;

    try {
      await updatePost.mutateAsync({
        id,
        data: {
          title: data.title,
          content: data.content,
          price: data.price || undefined,
          priceUnit: data.priceUnit || undefined,
          location: data.location || undefined,
          categoryIds: data.categoryId ? [data.categoryId] : undefined,
          thumbnail: thumbnailUrl,
        },
      });

      // Add new images (those without a server ID)
      const newImages = uploadedImages.filter((img) => !post?.images.find((pi) => pi.url === img.url));
      if (newImages.length > 0) {
        await addImages.mutateAsync({ postId: id, urls: newImages.map((img) => img.url) });
      }

      toast.success('Cập nhật thành công!');
      router.push('/dashboard/posts');
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    }
  };

  const handleDeleteServerImage = async (url: string) => {
    const serverImg = post?.images.find((img) => img.url === url);
    if (serverImg) {
      await postService.removeImage(serverImg.id);
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!post) return <div className="text-center py-20 text-neutral-500">Không tìm thấy bài đăng</div>;

  const isUploading = images.some((img) => img.uploading);
  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: `${cat.icon ?? ''} ${cat.name}`.trim() }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/posts">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Chỉnh sửa bài đăng</h1>
          <p className="text-sm text-neutral-500">Bài đăng sẽ về trạng thái chờ duyệt sau khi sửa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Section title="Thông tin cơ bản">
          <Input label="Tiêu đề" error={errors.title?.message} required {...register('title')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Danh mục" options={categoryOptions} placeholder="Chọn danh mục..." error={errors.categoryId?.message} required {...register('categoryId')} />
            <Input label="Địa điểm" placeholder="VD: Quận 1, TP.HCM" {...register('location')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Giá bán" type="number" min="0" hint="Để trống nếu thỏa thuận" {...register('price')} />
            <Select label="Đơn vị" options={PRICE_UNITS} {...register('priceUnit')} />
          </div>
        </Section>

        <Section title="Mô tả chi tiết">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} error={errors.content?.message} required />
            )}
          />
        </Section>

        <Section title={`Hình ảnh (${images.filter((i) => i.url).length}/10)`}>
          <ImageUploader images={images} onChange={setImages} onDeleteServer={handleDeleteServerImage} />
        </Section>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/posts"><Button variant="secondary">Hủy</Button></Link>
          <Button type="submit" isLoading={isSubmitting || updatePost.isPending} disabled={isUploading} leftIcon={<Save className="w-4 h-4" />}>
            {isUploading ? 'Đang upload...' : 'Lưu thay đổi'}
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
