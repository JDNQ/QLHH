"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { usePosts } from "@/hooks/usePosts";
import { useCategoryTree } from "@/hooks/useCategories";
import { Navbar } from "@/components/layout/Navbar";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { ListingFilter } from "@/components/listing/ListingFilter";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
];

const LIMIT = 12;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") ?? "",
  );
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));

  const debouncedSearch = useDebounce(search, 500);
  const debouncedLocation = useDebounce(location, 400);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (categoryId) params.set("categoryId", categoryId);
    if (debouncedLocation) params.set("location", debouncedLocation);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [
    debouncedSearch,
    categoryId,
    debouncedLocation,
    minPrice,
    maxPrice,
    sort,
    page,
    router,
  ]);

  const queryParams = {
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    location: debouncedLocation || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    page,
    limit: LIMIT,
  };

  const { data, isLoading, isFetching, isError, refetch } =
    usePosts(queryParams);
  const { data: categories = [] } = useCategoryTree();

  const posts = data?.data ?? [];
  const meta = data?.meta;

  const resetAll = useCallback(() => {
    setSearch("");
    setCategoryId("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  }, []);

  const handleFilterChange = (vals: {
    categoryId?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => {
    if (vals.categoryId !== undefined) setCategoryId(vals.categoryId ?? "");
    if (vals.location !== undefined) setLocation(vals.location ?? "");
    if (vals.minPrice !== undefined) setMinPrice(vals.minPrice ?? "");
    if (vals.maxPrice !== undefined) setMaxPrice(vals.maxPrice ?? "");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Hero search bar */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Bạn cần tìm gì?"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white h-11"
              />
            </div>

            <Select
              options={SORT_OPTIONS}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-44 h-11"
              wrapperClassName="shrink-0"
            />
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin max-w-4xl mx-auto">
              <button
                onClick={() => {
                  setCategoryId("");
                  setPage(1);
                }}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                  !categoryId
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary",
                )}
              >
                Tất cả
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setPage(1);
                  }}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                    categoryId === cat.id
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary",
                  )}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar filter */}
          <div className="hidden lg:block w-56 shrink-0">
            <ListingFilter
              categories={categories}
              values={{ categoryId, location, minPrice, maxPrice, sort }}
              onChange={handleFilterChange}
              onReset={resetAll}
            />
          </div>

          {/* Listing grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500">
                {isLoading ? "Đang tải..." : `${meta?.total ?? 0} kết quả`}
              </p>
            </div>

            <ListingGrid
              posts={posts}
              isLoading={isLoading}
              isFetching={isFetching}
              isError={isError}
              onRetry={refetch}
              page={page}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={setPage}
              columns={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <HomeInner />
    </Suspense>
  );
}
