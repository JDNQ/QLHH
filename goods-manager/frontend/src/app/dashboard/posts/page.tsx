'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPosts, useDeletePost } from '@/hooks/usePosts';
import { ListingTable } from '@/components/listing/ListingTable';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Post, PostStatus } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'EXPIRED', label: 'Hết hạn' },
];

export default function MyPostsPage() {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const router = useRouter();

  // Admin endpoint with userId filter – regular users see only their own posts
  const { data, isLoading } = useAdminPosts({
    search: search || undefined,
    status: (status as PostStatus) || undefined,
    userId: isAdmin ? undefined : user?.id,
    page,
    limit: 10,
  });

  const deletePost = useDeletePost();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa thất bại');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Bài đăng của tôi</h1>
        <Link href="/dashboard/posts/create">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Đăng tin mới</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Tìm kiếm bài đăng..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1 min-w-[200px]"
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          wrapperClassName="w-44"
        />
      </div>

      {/* Note for non-admin users */}
      {!isAdmin && (
        <div className="bg-info-light border border-info/20 rounded-xl px-4 py-3">
          <p className="text-sm text-info">
            Hiển thị tất cả bài đăng của bạn (bao gồm chờ duyệt, từ chối).
          </p>
        </div>
      )}

      <ListingTable
        posts={data?.data ?? []}
        isLoading={isLoading}
        showStatus
        onEdit={(post) => router.push(`/dashboard/posts/${post.id}/edit`)}
        onDelete={(post) => setDeleteTarget(post)}
      />

      {(data?.meta?.totalPages ?? 1) > 1 && (
        <Pagination
          page={page}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa bài đăng"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        isLoading={deletePost.isPending}
      />
    </div>
  );
}
