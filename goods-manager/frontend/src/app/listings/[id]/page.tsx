'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Clock, Eye, Phone, MessageSquare, Share2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { usePostDetail } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { PostStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatPrice, formatDate, formatFullDate, getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { data: post, isLoading, isError } = usePostDetail(id);
  const [activeImage, setActiveImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <PageSpinner />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Không tìm thấy bài đăng</h2>
          <p className="text-neutral-500 mb-6">Bài đăng đã bị xóa hoặc không tồn tại.</p>
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const images = [
    ...(post.thumbnail ? [{ id: 'thumb', url: post.thumbnail, isMain: true }] : []),
    ...post.images.filter((img) => img.url !== post.thumbnail),
  ];
  const displayImages = images.length > 0 ? images : [];

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để liên hệ');
      router.push('/auth/login');
      return;
    }
    toast.success('Chức năng nhắn tin đang phát triển');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-neutral-400 mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          {post.categories[0]?.category && (
            <>
              <span className="text-neutral-400">{post.categories[0].category.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-600 truncate max-w-[200px]">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images + Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image gallery */}
            {displayImages.length > 0 ? (
              <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-card">
                <div className="relative aspect-[16/10] bg-neutral-100">
                  <img
                    src={getImageUrl(displayImages[activeImage]?.url)}
                    alt={post.title}
                    className="w-full h-full object-contain"
                  />
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImage((prev) => Math.max(0, prev - 1))}
                        disabled={activeImage === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveImage((prev) => Math.min(displayImages.length - 1, prev + 1))}
                        disabled={activeImage === displayImages.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {displayImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImage ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {displayImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin">
                    {displayImages.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${i === activeImage ? 'border-primary' : 'border-neutral-100'}`}
                      >
                        <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Post content */}
            <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-xl font-bold text-neutral-900 leading-snug">{post.title}</h1>
                <PostStatusBadge status={post.status} />
              </div>

              <p className="text-2xl font-bold text-primary mb-3">
                {formatPrice(post.priceValue ?? post.price)}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-5 pb-5 border-b border-neutral-100">
                {post.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {post.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatFullDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.views} lượt xem
                </span>
              </div>

              <h2 className="text-base font-semibold text-neutral-800 mb-3">Mô tả chi tiết</h2>
              <div
                className="prose prose-sm max-w-none text-neutral-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Right: Seller info + Contact */}
          <div className="space-y-4">
            {/* Contact card */}
            <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                  {post.user.avatar ? (
                    <img src={getImageUrl(post.user.avatar)} alt={post.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{post.user.name}</p>
                  <p className="text-xs text-neutral-400">Người bán</p>
                </div>
              </div>

              <div className="space-y-2">
                {post.user.phone && (
                  <Button
                    variant={showPhone ? 'secondary' : 'primary'}
                    className="w-full"
                    leftIcon={<Phone className="w-4 h-4" />}
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Vui lòng đăng nhập để xem số điện thoại');
                        return;
                      }
                      setShowPhone(true);
                    }}
                  >
                    {showPhone ? post.user.phone : 'Xem số điện thoại'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                  onClick={handleContact}
                >
                  Nhắn tin
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={handleShare}
                >
                  Chia sẻ
                </Button>
              </div>
            </div>

            {/* Post info */}
            <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-card space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700">Thông tin bài đăng</h3>
              <InfoRow label="Danh mục" value={post.categories.map((c) => c.category.name).join(', ') || '—'} />
              <InfoRow label="Địa điểm" value={post.location ?? '—'} />
              <InfoRow label="Đơn vị giá" value={post.priceUnit ?? '—'} />
              <InfoRow label="Ngày đăng" value={formatDate(post.createdAt)} />
              {user?.id === post.userId && (
                <Link href={`/dashboard/posts/${post.id}/edit`}>
                  <Button variant="secondary" size="sm" className="w-full mt-2">Chỉnh sửa</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-neutral-400 shrink-0">{label}</span>
      <span className="text-xs text-neutral-700 font-medium text-right">{value}</span>
    </div>
  );
}
