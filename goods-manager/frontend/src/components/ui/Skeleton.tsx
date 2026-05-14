import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse bg-neutral-200 rounded-md', className)}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-card">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function DashboardMetricSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
          <Skeleton className="h-8 w-8 rounded-lg mb-3" />
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
