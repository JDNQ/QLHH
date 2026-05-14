'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Tag, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tổng quan', exact: true },
  { href: '/admin/posts', icon: FileText, label: 'Quản lý bài đăng' },
  { href: '/admin/users', icon: Users, label: 'Quản lý người dùng' },
  { href: '/admin/categories', icon: Tag, label: 'Danh mục' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 shrink-0">
      <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-card mb-3 flex items-center gap-2">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-900">Admin Panel</p>
          <p className="text-xs text-neutral-400">Quản trị hệ thống</p>
        </div>
      </div>

      <nav className="bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden">
        {navItems.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-[3px]',
              isActive(href, exact)
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
        <hr className="border-neutral-100" />
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors border-l-[3px] border-transparent"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard cá nhân
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-danger hover:bg-danger-light transition-colors border-l-[3px] border-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Đăng xuất
        </button>
      </nav>
    </aside>
  );
}
