'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, User, LogOut, LayoutDashboard, ShieldCheck, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 font-bold text-lg text-primary"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-black">M</div>
            <span className="hidden sm:block">MarketPlace</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-50 h-9"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/posts/create" className="hidden sm:flex">
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Đăng tin
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-1 w-52 bg-white border border-neutral-200 rounded-xl shadow-hover py-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                        <p className="text-xs font-medium text-neutral-900 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                      </div>
                      <DropdownItem
                        href="/dashboard"
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Quản lý của tôi"
                        onClick={() => setDropdownOpen(false)}
                      />
                      {isAdmin && (
                        <DropdownItem
                          href="/admin"
                          icon={<ShieldCheck className="w-4 h-4" />}
                          label="Quản trị"
                          onClick={() => setDropdownOpen(false)}
                        />
                      )}
                      <hr className="my-1 border-neutral-100" />
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger-light transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="secondary" size="sm">Đăng nhập</Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:flex">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
    >
      <span className="text-neutral-400">{icon}</span>
      {label}
    </Link>
  );
}
