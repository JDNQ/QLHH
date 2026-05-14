'use client';

import Link from 'next/link';
import { MapPin, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import { PostStatusBadge } from '@/components/ui/Badge';

interface ListingCardProps {
  post: Post;
  showStatus?: boolean;
}

export function ListingCard({ post, showStatus }: ListingCardProps) {
  const thumbnail =
    post.thumbnail ||
    post.images.find((img) => img.isMain)?.url ||
    post.images[0]?.url;

  const category = post.categories[0]?.category;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Link href={`/listings/${post.slug}`} className="block group">
        <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-card hover:shadow-hover transition-shadow duration-200">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
            {thumbnail ? (
              <img
                src={getImageUrl(thumbnail)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Featured badge */}
            {post.isFeatured && (
              <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Nổi bật
              </span>
            )}

            {/* Status badge */}
            {showStatus && (
              <div className="absolute top-2 right-2">
                <PostStatusBadge status={post.status} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            <p className="text-base font-bold text-primary mb-2">
              {formatPrice(post.priceValue ?? post.price)}
            </p>

            <div className="flex items-center justify-between text-xs text-neutral-400 mt-auto">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{post.location ?? 'Toàn quốc'}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>

            {category && (
              <div className="mt-2 pt-2 border-t border-neutral-50">
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">
                  {category.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
