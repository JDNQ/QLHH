import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price?: string | number | null): string {
  if (price == null || price === "") return "Thoa thuan";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(num)) return String(price);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} ty`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)} trieu`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString("vi-VN") + " VND";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Vua xong";
  if (mins < 60) return `${mins} phut truoc`;
  if (hours < 24) return `${hours} gio truoc`;
  if (days < 7) return `${days} ngay truoc`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPostStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Ban nhap",
    pending: "Cho duyet",
    approved: "Da duyet",
    rejected: "Bi tu choi",
    expired: "Het han",
  };
  return map[status.toLowerCase()] ?? status;
}

export function getPostStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    pending: "bg-warning-light text-warning",
    approved: "bg-success-light text-success",
    rejected: "bg-danger-light text-danger",
    expired: "bg-neutral-100 text-neutral-500",
  };
  return map[status.toLowerCase()] ?? "bg-neutral-100 text-neutral-500";
}

export function getUserRoleLabel(role: string): string {
  return role.toLowerCase() === "admin" ? "Quan tri" : "Nguoi dung";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function buildQueryString(params: Record<string, unknown>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  return qs ? `?${qs}` : "";
}

export function getImageUrl(path?: string | null): string {
  if (!path) {
    return "https://placehold.co/400x400/4b5563/ffffff?text=No+Image";
  }

  if (path.startsWith("http") || path.startsWith("blob:")) {
    return path;
  }

  const apiBaseRaw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  const apiBase = apiBaseRaw.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const cleanedPath = path.replace(/^\//, "");

  if (cleanedPath.startsWith("uploads/") || cleanedPath.startsWith("assets/")) {
    return `${apiBase}/${cleanedPath}`;
  }

  return `${apiBase}/uploads/${cleanedPath}`;
}
