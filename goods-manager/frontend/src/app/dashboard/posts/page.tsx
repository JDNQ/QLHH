"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { useAdminPosts, useDeletePost, useMyPosts } from "@/hooks/usePosts";
import { ListingTable } from "@/components/listing/ListingTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Post, PostStatus } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "Tat ca trang thai" },
  { value: "PENDING", label: "Cho duyet" },
  { value: "APPROVED", label: "Da duyet" },
  { value: "REJECTED", label: "Bi tu choi" },
  { value: "EXPIRED", label: "Het han" },
];

export default function MyPostsPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const router = useRouter();

  const postsQuery = {
    search: search || undefined,
    status: (status as PostStatus) || undefined,
    page,
    limit: 10,
  };

  const adminPosts = useAdminPosts(postsQuery, { enabled: isAdmin });
  const myPosts = useMyPosts(postsQuery, { enabled: !isAdmin });
  const data = isAdmin ? adminPosts.data : myPosts.data;
  const isLoading = isAdmin ? adminPosts.isLoading : myPosts.isLoading;
  const deletePost = useDeletePost();

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deletePost.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Xoa that bai");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Bai dang cua toi</h1>
        <Link href="/dashboard/posts/create">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Dang tin moi</Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Tim kiem bai dang..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1 min-w-[200px]"
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          wrapperClassName="w-44"
        />
      </div>

      {!isAdmin && (
        <div className="bg-info-light border border-info/20 rounded-xl px-4 py-3">
          <p className="text-sm text-info">
            Hien thi tat ca bai dang cua ban, bao gom cho duyet va tu choi.
          </p>
        </div>
      )}

      <ListingTable
        posts={data?.data ?? []}
        isLoading={isLoading}
        showStatus
        onEdit={(post) => router.push(`/dashboard/posts/${post.id}/edit`)}
        onDelete={(post) => setDeleteTarget(post)}
      />

      {(data?.meta?.totalPages ?? 1) > 1 && (
        <Pagination
          page={page}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xoa bai dang"
        description={`Ban co chac muon xoa "${deleteTarget?.title}"? Hanh dong nay khong the hoan tac.`}
        confirmLabel="Xoa"
        isLoading={deletePost.isPending}
      />
    </div>
  );
}
