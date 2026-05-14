'use client';

import { useState } from 'react';
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react';
import { useUsers, useToggleUserActive, useDeleteUser } from '@/hooks/useUsers';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatFullDate, getImageUrl } from '@/lib/utils';
import { User } from '@/types';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<{ user: User; action: 'toggle' | 'delete' } | null>(null);

  const { data, isLoading } = useUsers({ search: search || undefined, page, limit: 15 });
  const toggleActive = useToggleUserActive();
  const deleteUser = useDeleteUser();

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      if (confirmTarget.action === 'toggle') {
        await toggleActive.mutateAsync(confirmTarget.user.id);
      } else {
        await deleteUser.mutateAsync(confirmTarget.user.id);
      }
      setConfirmTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Thao tác thất bại');
    }
  };

  const pending = toggleActive.isPending || deleteUser.isPending;
  const target = confirmTarget?.user;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Quản lý người dùng</h1>
          <p className="text-sm text-neutral-500">{data?.meta?.total ?? 0} tài khoản</p>
        </div>
      </div>

      <Input
        placeholder="Tìm theo tên hoặc email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        leftIcon={<Search className="w-4 h-4" />}
        wrapperClassName="max-w-sm"
      />

      <div className="overflow-x-auto rounded-xl border border-neutral-100 shadow-card bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Người dùng</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Số điện thoại</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Vai trò</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Ngày tạo</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
            ) : (data?.data ?? []).length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-neutral-400">Không có người dùng nào</td></tr>
            ) : (
              (data?.data ?? []).map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                        {user.avatar ? (
                          <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-400">
                            {user.name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs">{user.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-400 text-xs">{formatFullDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirmTarget({ user, action: 'toggle' })}
                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        className={user.isActive ? 'text-warning hover:bg-warning-light' : 'text-success hover:bg-success-light'}
                      >
                        {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirmTarget({ user, action: 'delete' })}
                        title="Xóa tài khoản"
                        className="text-danger hover:bg-danger-light"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(data?.meta?.totalPages ?? 1) > 1 && (
        <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirm}
        isLoading={pending}
        variant={confirmTarget?.action === 'delete' ? 'danger' : 'warning'}
        title={
          confirmTarget?.action === 'toggle'
            ? target?.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
            : 'Xóa tài khoản'
        }
        description={
          confirmTarget?.action === 'toggle'
            ? `${target?.isActive ? 'Khóa' : 'Mở khóa'} tài khoản "${target?.name}"?`
            : `Xóa tài khoản "${target?.name}"? Toàn bộ bài đăng của người dùng này cũng sẽ bị xóa.`
        }
        confirmLabel={confirmTarget?.action === 'delete' ? 'Xóa' : target?.isActive ? 'Khóa' : 'Mở khóa'}
      />
    </div>
  );
}
