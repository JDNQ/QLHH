'use client';

import { Post } from '@/types';
import { ListingCard } from './ListingCard';
import { ListingCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { PackageSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface ListingGridProps {
  posts: Post[];
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showStatus?: boolean;
  columns?: 2 | 3 | 4;
}

const colClass = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
};

export function ListingGrid({
  posts,
  isLoading,
  isFetching,
  isError,
  onRetry,
  page,
  totalPages,
  onPageChange,
  showStatus,
  columns = 4,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-3 ${colClass[columns]}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-danger-light rounded-full flex items-center justify-center mb-4">
          <RefreshCw className="w-7 h-7 text-danger" />
        </div>
        <h3 className="text-base font-semibold text-neutral-800 mb-1">Có lỗi xảy ra</h3>
        <p className="text-sm text-neutral-500 mb-4">Không thể tải dữ liệu, vui lòng thử lại.</p>
        <Button variant="secondary" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <PackageSearch className="w-7 h-7 text-neutral-400" />
        </div>
        <h3 className="text-base font-semibold text-neutral-800 mb-1">Không tìm thấy kết quả</h3>
        <p className="text-sm text-neutral-500">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
      </div>
    );
  }

  return (
    <div>
      {isFetching && !isLoading && (
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Spinner size="sm" />
            <span>Đang cập nhật...</span>
          </div>
        </div>
      )}
      <div className={`grid gap-3 ${colClass[columns]}`}>
        {posts.map((post) => (
          <ListingCard key={post.id} post={post} showStatus={showStatus} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
