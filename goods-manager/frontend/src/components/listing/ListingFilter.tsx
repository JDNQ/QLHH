'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Category } from '@/types';

interface FilterValues {
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

interface ListingFilterProps {
  categories: Category[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
}

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export function ListingFilter({ categories, values, onChange, onReset }: ListingFilterProps) {
  const [showFilter, setShowFilter] = useState(false);
  const hasActiveFilter = !!(values.categoryId || values.location || values.minPrice || values.maxPrice);

  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...values, [key]: value || undefined });
  };

  return (
    <div className="space-y-4">
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="w-3.5 h-3.5" />}
          onClick={() => setShowFilter(!showFilter)}
          className="w-full"
        >
          Bộ lọc {hasActiveFilter && <span className="ml-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">!</span>}
        </Button>
      </div>

      <div className={`space-y-4 ${showFilter ? 'block' : 'hidden lg:block'}`}>
        {/* Category */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-card p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Danh mục</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
            <button
              onClick={() => update('categoryId', '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !values.categoryId ? 'bg-orange-50 text-primary font-medium' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Tất cả danh mục
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => update('categoryId', cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  values.categoryId === cat.id ? 'bg-orange-50 text-primary font-medium' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-card p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Khoảng giá</h3>
          <div className="space-y-2">
            <Input
              placeholder="Giá từ (₫)"
              value={values.minPrice ?? ''}
              onChange={(e) => update('minPrice', e.target.value)}
              type="number"
              min="0"
            />
            <Input
              placeholder="Giá đến (₫)"
              value={values.maxPrice ?? ''}
              onChange={(e) => update('maxPrice', e.target.value)}
              type="number"
              min="0"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-card p-4">
          <h3 className="text-sm font-semibold text-neutral-800 mb-3">Địa điểm</h3>
          <Input
            placeholder="Nhập địa điểm..."
            value={values.location ?? ''}
            onChange={(e) => update('location', e.target.value)}
          />
        </div>

        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<X className="w-3.5 h-3.5" />}
            className="w-full text-danger hover:bg-danger-light"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
