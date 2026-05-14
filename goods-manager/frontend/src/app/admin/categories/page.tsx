'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Category, CreateCategoryData } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import slugify from 'slugify';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  icon: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategoryTree();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', icon: '', description: '', parentId: '', sortOrder: 0, isActive: true });
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    reset({
      name: cat.name,
      icon: cat.icon ?? '',
      description: cat.description ?? '',
      parentId: cat.parentId ?? '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setFormOpen(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    const payload: CreateCategoryData = {
      name: data.name,
      icon: data.icon || undefined,
      description: data.description || undefined,
      parentId: data.parentId || undefined,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    };
    try {
      if (editTarget) {
        await updateCategory.mutateAsync({ id: editTarget.id, data: payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi khi lưu danh mục');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa thất bại');
    }
  };

  const nameValue = watch('name');

  // Flat list of root categories for parent select
  const parentOptions = [
    { value: '', label: 'Không có (danh mục gốc)' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Danh mục</h1>
          <p className="text-sm text-neutral-500">{categories.length} danh mục gốc</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>Thêm danh mục</Button>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">Chưa có danh mục nào</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {categories.map((cat) => (
              <div key={cat.id}>
                <CategoryRow
                  cat={cat}
                  onEdit={() => openEdit(cat)}
                  onDelete={() => setDeleteTarget(cat)}
                  canDelete={!cat.children?.length}
                />
                {cat.children?.map((child) => (
                  <CategoryRow
                    key={child.id}
                    cat={child}
                    indent
                    onEdit={() => openEdit(child)}
                    onDelete={() => setDeleteTarget(child)}
                    canDelete={!child.children?.length}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editTarget ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 space-y-4">
            <Input label="Tên danh mục" error={errors.name?.message} required {...register('name')} />
            {nameValue && (
              <p className="text-xs text-neutral-400">
                Slug: <span className="font-mono">{slugify(nameValue, { lower: true, strict: true })}</span>
              </p>
            )}
            <Input label="Icon (emoji)" placeholder="VD: 🚗" {...register('icon')} />
            <Input label="Mô tả" {...register('description')} />
            <Select label="Danh mục cha" options={parentOptions} {...register('parentId')} />
            <Input label="Thứ tự hiển thị" type="number" {...register('sortOrder', { valueAsNumber: true })} />
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-primary" {...register('isActive')} />
              Hiển thị danh mục
            </label>
          </div>
          <div className="px-6 pb-5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isSubmitting || createCategory.isPending || updateCategory.isPending}>
              {editTarget ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa danh mục"
        description={`Xóa danh mục "${deleteTarget?.name}"?`}
        confirmLabel="Xóa"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}

function CategoryRow({ cat, onEdit, onDelete, canDelete, indent }: {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${indent ? 'pl-10' : ''}`}>
      {indent && <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />}
      <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center text-lg shrink-0">
        {cat.icon ?? '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900">{cat.name}</p>
        {cat.description && <p className="text-xs text-neutral-400 truncate">{cat.description}</p>}
      </div>
      <Badge variant={cat.isActive ? 'success' : 'default'} dot>
        {cat.isActive ? 'Hiển thị' : 'Ẩn'}
      </Badge>
      <span className="text-xs text-neutral-400 hidden lg:block">#{cat.sortOrder}</span>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Sửa">
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={!canDelete}
          title={!canDelete ? 'Xóa danh mục con trước' : 'Xóa'}
          className="text-danger hover:bg-danger-light disabled:opacity-30"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
