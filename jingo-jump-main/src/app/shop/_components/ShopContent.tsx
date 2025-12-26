"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Grid3x3, List, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "~/app/_components/shop/ProductCard";
import { FilterSidebar } from "~/app/_components/shop/FilterSidebar";
import { categorizeSizeFromDimensions, type Product, type FilterOptions } from "~/types/product";

type ViewMode = "grid" | "list";
type SortOption = "featured" | "price-low" | "price-high" | "newest" | "popular";

interface ShopContentProps {
  products: Product[];
  filterOptions: FilterOptions;
}

export function ShopContent({ products, filterOptions }: ShopContentProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Show 8 products on mobile (4 rows x 2 cols), 18 on desktop
  const [productsPerPage, setProductsPerPage] = useState(8);

  useEffect(() => {
    const updateProductsPerPage = () => {
      // Mobile: < 768px (md breakpoint)
      setProductsPerPage(window.innerWidth < 768 ? 8 : 18);
    };

    updateProductsPerPage();
    window.addEventListener('resize', updateProductsPerPage);
    return () => window.removeEventListener('resize', updateProductsPerPage);
  }, []);

  // Get filter values from URL
  const selectedCategories = useMemo(() => {
    const categories = searchParams.get("categories");
    return categories ? categories.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const selectedSizes = useMemo(() => {
    const sizes = searchParams.get("sizes");
    return sizes ? sizes.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const selectedAges = useMemo(() => {
    const ages = searchParams.get("ages");
    return ages ? ages.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const minPrice = useMemo(() => {
    const value = searchParams.get("minPrice");
    return value ? Number(value) : null;
  }, [searchParams]);

  const maxPrice = useMemo(() => {
    const value = searchParams.get("maxPrice");
    return value ? Number(value) : null;
  }, [searchParams]);

  // Filter products based on URL params
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter - match by category label converted to id format
      if (selectedCategories.length > 0) {
        const productCategoryId = product.category.toLowerCase().replace(/\s+/g, "-");
        if (!selectedCategories.includes(productCategoryId)) {
          return false;
        }
      }

      // Size filter - use categorized sizes (small, medium, large)
      if (selectedSizes.length > 0) {
        const productSizeCategory = categorizeSizeFromDimensions(product.size);
        if (!productSizeCategory || !selectedSizes.includes(productSizeCategory)) {
          return false;
        }
      }

      // Age filter
      if (selectedAges.length > 0 && product.ageRange) {
        const productAgeId = product.ageRange.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-");
        if (!selectedAges.includes(productAgeId)) {
          return false;
        }
      } else if (selectedAges.length > 0 && !product.ageRange) {
        return false;
      }

      // Price filter
      if (minPrice !== null && product.price < minPrice) {
        return false;
      }
      if (maxPrice !== null && product.price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategories, selectedSizes, selectedAges, minPrice, maxPrice]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        // Sort by id - handle both string and number IDs
        return sorted.sort((a, b) => {
          const aId = typeof a.id === "string" ? a.id : String(a.id);
          const bId = typeof b.id === "string" ? b.id : String(b.id);
          return bId.localeCompare(aId);
        });
      case "popular":
        return sorted.sort((a, b) => (b.badge === "POPULAR" ? 1 : 0) - (a.badge === "POPULAR" ? 1 : 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Calculate pagination
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSizes, selectedAges, minPrice, maxPrice]);

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white sm:mb-3 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs lg:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Filters
      </button>

      {/* Mobile Filter Drawer Overlay */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm transform overflow-y-auto bg-white transition-transform duration-300 lg:hidden ${
          showMobileFilters ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-black text-slate-900">Filters</h2>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <FilterSidebar filterOptions={filterOptions} />
        </div>
      </div>

      <div className="grid gap-0 sm:gap-6 lg:grid-cols-[280px_1fr] lg:gap-8 xl:grid-cols-[320px_1fr]">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block">
          <FilterSidebar filterOptions={filterOptions} />
        </div>

        {/* Main Content */}
        <main className="min-w-0 w-full">
        {/* Toolbar */}
        <div className="mb-2 flex flex-col gap-1.5 sm:mb-4 sm:flex-row sm:items-center sm:justify-between lg:mb-6">
          <div className="text-[10px] font-semibold text-slate-600 sm:text-xs lg:text-sm">
            {totalProducts > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalProducts)} of {totalProducts}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Toggle - Hidden on mobile */}
            <div className="hidden rounded-lg border border-slate-200 sm:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Grid3x3 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 border-l border-slate-200 px-3 py-1.5 text-xs font-bold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                List
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-700 transition-all focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20 sm:flex-none sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs lg:px-4 lg:py-2.5 lg:text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid w-full max-w-full grid-cols-2 gap-1 overflow-hidden sm:gap-3 md:grid-cols-3 md:gap-4 lg:gap-5"
                : "flex flex-col gap-3"
            }
          >
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16 lg:py-20">
            <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl lg:text-6xl">🔍</div>
            <h3 className="mb-1 text-lg font-bold text-slate-900 sm:mb-2 sm:text-xl lg:text-2xl">No products found</h3>
            <p className="text-sm text-slate-600 sm:text-base">
              Try adjusting your filters or browse all products
            </p>
            <Link
              href="/shop"
              className="mt-4 rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 sm:mt-6 sm:px-6 sm:py-3 sm:text-base"
            >
              View All Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-1.5 sm:mt-8 sm:gap-2 lg:mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700 sm:h-10 sm:w-10 sm:rounded-xl lg:h-12 lg:w-12"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-all sm:h-10 sm:w-10 sm:rounded-xl lg:h-12 lg:w-12 ${
                    currentPage === page
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700 sm:h-10 sm:w-10 sm:rounded-xl lg:h-12 lg:w-12"
            >
              ›
            </button>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
