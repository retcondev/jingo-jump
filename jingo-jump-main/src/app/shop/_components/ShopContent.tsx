"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Grid3x3, List } from "lucide-react";
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
  const productsPerPage = 9;

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
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      {/* Sidebar Filters */}
      <FilterSidebar filterOptions={filterOptions} />

      {/* Main Content */}
      <main>
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-600">
            Showing {totalProducts > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalProducts)} of{" "}
            {totalProducts} products
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 border-l border-slate-200 px-4 py-2 text-sm font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-6"
            }
          >
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">
              Try adjusting your filters or browse all products
            </p>
            <Link
              href="/shop"
              className="mt-6 px-6 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white font-bold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border font-bold transition-all ${
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
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white font-bold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700"
            >
              ›
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
