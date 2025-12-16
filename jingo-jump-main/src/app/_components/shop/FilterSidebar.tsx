"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { FilterOptions } from "~/types/product";

interface FilterSidebarProps {
  filterOptions: FilterOptions;
}

export function FilterSidebar({ filterOptions }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const selectedCategories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const selectedSizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? [];
  const selectedAges = searchParams.get("ages")?.split(",").filter(Boolean) ?? [];
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : filterOptions.priceRange.min;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : filterOptions.priceRange.max;

  // Update URL with new filter values
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId);
    updateFilters({ categories: newCategories.length > 0 ? newCategories.join(",") : null });
  };

  const handleSizeChange = (sizeId: string, checked: boolean) => {
    const newSizes = checked
      ? [...selectedSizes, sizeId]
      : selectedSizes.filter((id) => id !== sizeId);
    updateFilters({ sizes: newSizes.length > 0 ? newSizes.join(",") : null });
  };

  const handleAgeChange = (ageId: string, checked: boolean) => {
    const newAges = checked
      ? [...selectedAges, ageId]
      : selectedAges.filter((id) => id !== ageId);
    updateFilters({ ages: newAges.length > 0 ? newAges.join(",") : null });
  };

  const handlePriceChange = (min: number, max: number) => {
    updateFilters({
      minPrice: min !== filterOptions.priceRange.min ? String(min) : null,
      maxPrice: max !== filterOptions.priceRange.max ? String(max) : null,
    });
  };

  const handleClearFilters = () => {
    router.push("/shop", { scroll: false });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedAges.length > 0 ||
    minPrice !== filterOptions.priceRange.min ||
    maxPrice !== filterOptions.priceRange.max;

  return (
    <aside className="sticky top-24 h-fit w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-8">
      {/* Category Filter */}
      <div className="mb-8 lg:mb-10">
        <h3 className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-slate-900 lg:tracking-[0.5em]">
          Category
        </h3>
        <div className="space-y-3">
          {filterOptions.categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-3 transition-colors hover:text-fuchsia-600"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-fuchsia-600 focus:ring-2 focus:ring-fuchsia-500"
              />
              <span className="flex flex-1 justify-between text-sm font-semibold text-slate-700">
                <span className="truncate">{category.label}</span>
                <span className="ml-2 shrink-0 text-slate-400">{category.count}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8 lg:mb-10">
        <h3 className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-slate-900 lg:tracking-[0.5em]">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
            placeholder="Min"
            className="w-0 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-sm font-semibold transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 lg:px-3"
          />
          <span className="shrink-0 font-bold text-slate-400">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
            placeholder="Max"
            className="w-0 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-sm font-semibold transition-all focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 lg:px-3"
          />
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-8 lg:mb-10">
        <h3 className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-slate-900 lg:tracking-[0.5em]">
          Size
        </h3>
        <div className="space-y-3">
          {filterOptions.sizes.map((size) => (
            <label
              key={size.id}
              className="flex cursor-pointer items-center gap-3 transition-colors hover:text-fuchsia-600"
            >
              <input
                type="checkbox"
                checked={selectedSizes.includes(size.id)}
                onChange={(e) => handleSizeChange(size.id, e.target.checked)}
                className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-fuchsia-600 focus:ring-2 focus:ring-fuchsia-500"
              />
              <span className="flex flex-1 justify-between text-sm font-semibold text-slate-700">
                <span className="truncate">{size.label}</span>
                <span className="ml-2 shrink-0 text-slate-400">{size.count}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Age Range Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-slate-900 lg:tracking-[0.5em]">
          Age Range
        </h3>
        <div className="space-y-3">
          {filterOptions.ageRanges.map((age) => (
            <label
              key={age.id}
              className="flex cursor-pointer items-center gap-3 transition-colors hover:text-fuchsia-600"
            >
              <input
                type="checkbox"
                checked={selectedAges.includes(age.id)}
                onChange={(e) => handleAgeChange(age.id, e.target.checked)}
                className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-fuchsia-600 focus:ring-2 focus:ring-fuchsia-500"
              />
              <span className="flex flex-1 justify-between text-sm font-semibold text-slate-700">
                <span className="truncate">{age.label}</span>
                <span className="ml-2 shrink-0 text-slate-400">{age.count}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-700 transition-all duration-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white lg:px-6"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
