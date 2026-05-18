"use client";

import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  TrendingUp,
} from "lucide-react";
import { useAdminStats } from "@/hooks/usePosts";
import { useUsers } from "@/hooks/useUsers";
import { DashboardMetricSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function AdminPage() {
  // Tránh gọi /posts/admin/stats khi user chưa sẵn sàng (tránh log 403)
  const { data: stats, isLoading } = useAdminStats();
  const { data: usersData } = useUsers({ limit: 1 });

  const metrics = [
    {
      label: "Tổng bài đăng",
      value: stats?.total ?? 0,
      icon: FileText,
      color: "text-info",
      bg: "bg-info-light",
      href: "/admin/posts",
    },
    {
      label: "Chờ duyệt",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning-light",
      href: "/admin/posts?status=PENDING",
    },
    {
      label: "Đã duyệt",
      value: stats?.approved ?? 0,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success-light",
      href: "/admin/posts?status=APPROVED",
    },
    {
      label: "Bị từ chối",
      value: stats?.rejected ?? 0,
      icon: XCircle,
      color: "text-danger",
      bg: "bg-danger-light",
      href: "/admin/posts?status=REJECTED",
    },
    {
      label: "Nổi bật",
      value: stats?.featured ?? 0,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-orange-100",
      href: "/admin/posts",
    },
    {
      label: "Người dùng",
      value: usersData?.meta?.total ?? "—",
      icon: Users,
      color: "text-neutral-600",
      bg: "bg-neutral-100",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">
          Tổng quan hệ thống
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Thống kê và quản lý MarketPlace
        </p>
      </div>

      {isLoading ? (
        <DashboardMetricSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href}>
              <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card hover:shadow-hover transition-shadow cursor-pointer">
                <div
                  className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickCard
          href="/admin/posts?status=PENDING"
          title="Duyệt bài đăng"
          desc={`${stats?.pending ?? 0} bài chờ duyệt`}
          urgent={!!stats?.pending}
        />
        <QuickCard
          href="/admin/users"
          title="Quản lý người dùng"
          desc="Xem và quản lý tài khoản"
        />
        <QuickCard
          href="/admin/categories"
          title="Danh mục"
          desc="Quản lý danh mục sản phẩm"
        />
      </div>
    </div>
  );
}

function QuickCard({
  href,
  title,
  desc,
  urgent,
}: {
  href: string;
  title: string;
  desc: string;
  urgent?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`rounded-xl p-4 border transition-shadow cursor-pointer hover:shadow-hover ${urgent ? "bg-warning-light border-warning/30" : "bg-white border-neutral-100 shadow-card"}`}
      >
        <p
          className={`font-semibold text-sm ${urgent ? "text-warning" : "text-neutral-800"}`}
        >
          {title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
