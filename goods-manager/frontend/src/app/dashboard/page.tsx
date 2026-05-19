'use client';

import Link from 'next/link';
import { FileText, CheckCircle, Clock, XCircle, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/usePosts';
import { usePosts } from '@/hooks/usePosts';
import { DashboardMetricSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { PostStatusBadge } from '@/components/ui/Badge';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminStats({
    enabled: isAdmin,
  });
  // Show recent approved posts for non-admin (approximate "activity")
  const { data: recentData, isLoading: postsLoading } = usePosts({ limit: 5 });

  const metrics = isAdmin
    ? [
        { label: 'Tổng bài đăng', value: stats?.total ?? 0, icon: FileText, color: 'text-info', bg: 'bg-info-light' },
        { label: 'Đã duyệt', value: stats?.approved ?? 0, icon: CheckCircle, color: 'text-success', bg: 'bg-success-light' },
        { label: 'Chờ duyệt', value: stats?.pending ?? 0, icon: Clock, color: 'text-warning', bg: 'bg-warning-light' },
        { label: 'Bị từ chối', value: stats?.rejected ?? 0, icon: XCircle, color: 'text-danger', bg: 'bg-danger-light' },
      ]
    : [
        { label: 'Bài đăng', value: '—', icon: FileText, color: 'text-primary', bg: 'bg-orange-100' },
        { label: 'Đã duyệt', value: '—', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light' },
        { label: 'Chờ duyệt', value: '—', icon: Clock, color: 'text-warning', bg: 'bg-warning-light' },
        { label: 'Lượt xem', value: '—', icon: FileText, color: 'text-info', bg: 'bg-info-light' },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Xin chào, {user?.name}! 👋</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Quản lý bài đăng và hoạt động của bạn</p>
        </div>
        <Link href="/dashboard/posts/create">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Đăng tin mới</Button>
        </Link>
      </div>

      {/* Metrics */}
      {statsLoading && isAdmin ? (
        <DashboardMetricSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/dashboard/posts/create">
          <div className="bg-primary text-white rounded-xl p-4 hover:bg-primary-600 transition-colors cursor-pointer">
            <Plus className="w-6 h-6 mb-2" />
            <p className="font-semibold text-sm">Đăng tin mới</p>
            <p className="text-xs text-orange-100 mt-0.5">Tạo bài đăng ngay</p>
          </div>
        </Link>
        <Link href="/dashboard/posts">
          <div className="bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-hover transition-shadow cursor-pointer">
            <FileText className="w-6 h-6 text-neutral-400 mb-2" />
            <p className="font-semibold text-sm text-neutral-800">Bài đăng của tôi</p>
            <p className="text-xs text-neutral-400 mt-0.5">Quản lý bài đăng</p>
          </div>
        </Link>
        <Link href="/dashboard/profile">
          <div className="bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-hover transition-shadow cursor-pointer">
            <CheckCircle className="w-6 h-6 text-neutral-400 mb-2" />
            <p className="font-semibold text-sm text-neutral-800">Hồ sơ</p>
            <p className="text-xs text-neutral-400 mt-0.5">Cập nhật thông tin</p>
          </div>
        </Link>
      </div>

      {/* Recent listings */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-card">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 text-sm">Tin đăng gần đây</h2>
          <Link href="/" className="text-xs text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {postsLoading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-14 h-12 bg-neutral-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {(recentData?.data ?? []).slice(0, 5).map((post) => {
              const thumb = post.thumbnail || post.images[0]?.url;
              return (
                <Link key={post.id} href={`/listings/${post.slug}`} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    {thumb && <img src={getImageUrl(thumb)} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{post.title}</p>
                    <p className="text-xs text-neutral-400">{formatDate(post.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-primary">
                    {formatPrice(post.priceValue ?? post.price)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
