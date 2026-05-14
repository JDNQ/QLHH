import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price?: string | number | null): string {
  if (price == null || price === '') return 'Thỏa thuận';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)} triệu`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString('vi-VN') + ' ₫';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPostStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:  'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
    EXPIRED:  'Hết hạn',
  };
  return map[status] ?? status;
}

export function getPostStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:  'bg-warning-light text-warning',
    APPROVED: 'bg-success-light text-success',
    REJECTED: 'bg-danger-light text-danger',
    EXPIRED:  'bg-neutral-100 text-neutral-500',
  };
  return map[status] ?? 'bg-neutral-100 text-neutral-500';
}

export function getUserRoleLabel(role: string): string {
  return role === 'ADMIN' ? 'Quản trị' : 'Người dùng';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function buildQueryString(params: Record<string, unknown>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export function getImageUrl(path?: string | null): string {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:3001';
  return `${base}/${path.replace(/^\//, '')}`;
}
