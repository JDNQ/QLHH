"use client";

import Link from "next/link";
import { Edit, Trash2, Eye } from "lucide-react";

import { Post } from "@/types";
import { formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import { PostStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

interface ListingTableProps {
  posts: Post[];
  isLoading?: boolean;
  onDelete?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  showActions?: boolean;
  showStatus?: boolean;
  extraActions?: (post: Post) => React.ReactNode;
}

export function ListingTable({
  posts,
  isLoading,
  onDelete,
  onEdit,
  showActions = true,
  showStatus = true,
  extraActions,
}: ListingTableProps) {
  const colsForSkeleton = (showActions ? 7 : 6) - (showStatus ? 0 : 1);

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-100 shadow-card bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-16">
              Ảnh
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Tiêu đề
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">
              Giá
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
              Địa điểm
            </th>

            {showStatus && (
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Trạng thái
              </th>
            )}

            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
              Ngày đăng
            </th>

            {showActions && (
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Thao tác
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={colsForSkeleton} />
            ))
          ) : posts.length === 0 ? (
            <tr>
              <td
                colSpan={colsForSkeleton}
                className="text-center py-12 text-neutral-400 text-sm"
              >
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            posts.map((post) => {
              const thumb = post.thumbnail || post.images[0]?.url;

              return (
                <tr
                  key={post.id}
                  className="hover:bg-neutral-50/60 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                      {thumb ? (
                        <img
                          src={getImageUrl(thumb)}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 max-w-[240px]">
                    <Link
                      href={`/listings/${post.slug}`}
                      className="font-medium text-neutral-900 hover:text-primary line-clamp-2 block"
                    >
                      {post.title}
                    </Link>

                    {post.isFeatured && (
                      <span className="text-[10px] bg-orange-100 text-primary px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block">
                        Nổi bật
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell font-semibold text-primary whitespace-nowrap">
                    {formatPrice(post.priceValue ?? post.price)}
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                    {post.location ?? "—"}
                  </td>

                  {showStatus && (
                    <td className="px-4 py-3">
                      <PostStatusBadge status={post.status} />
                    </td>
                  )}

                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-400 text-xs whitespace-nowrap">
                    {formatDate(post.createdAt)}
                  </td>

                  {showActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {extraActions?.(post)}

                        <Link href={`/listings/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="icon-sm" title="Xem">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(post)}
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(post)}
                            title="Xóa"
                            className="text-danger hover:bg-danger-light"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
