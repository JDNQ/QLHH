'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, PlusCircle, MessageSquare, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan', exact: true },
  { href: '/dashboard/posts', icon: FileText, label: 'Bài đăng của tôi' },
  { href: '/dashboard/posts/create', icon: PlusCircle, label: 'Đăng tin mới' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Tin nhắn' },
  { href: '/dashboard/profile', icon: User, label: 'Hồ sơ' },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && !(href === '/dashboard/posts' && pathname.includes('/create'));
  };

  return (
    <aside className="w-56 shrink-0">
      {/* User info */}
      <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-card mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
            {user?.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
