'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdminPosts, useAdminUpdateStatus, useDeletePost } from '@/hooks/usePosts';
import { ListingTable } from '@/components/listing/ListingTable';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Post, PostStatus } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type TabStatus = 'PENDING' | 'ALL';

export default function AdminPostsPage() {
  const [tab, setTab] = useState<TabStatus>('PENDING');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<Post | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const { data, isLoading } = useAdminPosts({
    status: tab === 'PENDING' ? 'PENDING' : undefined,
    search: search || undefined,
    page,
    limit: 10,
  });

  const updateStatus = useAdminUpdateStatus();
  const deletePost = useDeletePost();

  const handleApprove = async (post: Post) => {
    try {
      await updateStatus.mutateAsync({ id: post.id, data: { status: 'APPROVED' as PostStatus } });
      toast.success('Đã duyệt bài đăng');
    } catch (err: any) {
      toast.error(err?.message ?? 'Duyệt thất bại');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await updateStatus.mutateAsync({
        id: rejectTarget.id,
        data: { status: 'REJECTED' as PostStatus },
      });
      toast.success('Đã từ chối bài đăng');
      setRejectTarget(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Từ chối thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa thất bại');
    }
  };

  const pendingCount = tab === 'PENDING' ? data?.meta?.total : undefined;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Quản lý bài đăng</h1>
        <p className="text-sm text-neutral-500">{data?.meta?.total ?? 0} bài đăng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-0">
        {[{ key: 'PENDING', label: 'Chờ duyệt', icon: Clock }, { key: 'ALL', label: 'Tất cả', icon: null }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key as TabStatus); setPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              tab === key ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700',
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
            {key === 'PENDING' && tab === 'PENDING' && pendingCount !== undefined && (
              <Badge variant="warning" className="text-[10px] py-0 px-1.5">{pendingCount}</Badge>
            )}
          </button>
        ))}
      </div>

      <Input
        placeholder="Tìm theo tiêu đề..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        leftIcon={<Search className="w-4 h-4" />}
        wrapperClassName="max-w-sm"
      />

      <ListingTable
        posts={data?.data ?? []}
        isLoading={isLoading}
        showStatus
        showActions
        onDelete={(post) => setDeleteTarget(post)}
        extraActions={(post) => (
          <>
            {post.status !== 'APPROVED' && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleApprove(post)}
                title="Duyệt"
                className="text-success hover:bg-success-light"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            )}
            {post.status !== 'REJECTED' && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setRejectTarget(post)}
                title="Từ chối"
                className="text-warning hover:bg-warning-light"
              >
                <XCircle className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        )}
      />

      {(data?.meta?.totalPages ?? 1) > 1 && (
        <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
      )}

      {/* Reject modal */}
      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Từ chối bài đăng" size="sm">
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-neutral-600">
            Từ chối bài đăng: <strong>{rejectTarget?.title}</strong>
          </p>
          <Textarea
            label="Lý do từ chối (tùy chọn)"
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
        </div>
        <div className="px-6 pb-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRejectTarget(null)}>Hủy</Button>
          <Button variant="danger" onClick={handleReject} isLoading={updateStatus.isPending}>Từ chối</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa bài đăng"
        description={`Xóa vĩnh viễn bài "${deleteTarget?.title}"?`}
        confirmLabel="Xóa"
        isLoading={deletePost.isPending}
      />
    </div>
  );
}
