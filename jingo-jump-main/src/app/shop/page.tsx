"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Grid3x3, List } from "lucide-react";
import { ProductCard } from "~/app/_components/shop/ProductCard";
import { FilterSidebar } from "~/app/_components/shop/FilterSidebar";
import { mockProducts, filterOptions } from "~/data/mockProducts";

type ViewMode = "grid" | "list";
type SortOption = "featured" | "price-low" | "price-high" | "newest" | "popular";

// Map URL category params to product categories
const categoryMap: Record<string, string> = {
  "bouncers-15x15": "Bouncers 15x15",
  "water-slides": "Water Slide",
  "combo-units": "Combo Unit",
  "standard-bouncers": "Standard Bouncer",
  "obstacle-courses": "Obstacle Course",
  "interactive-games": "Interactive Game",
  "commercial-units": "Commercial Unit",
  "light-commercial": "Light Commercial",
  "open-box": "Open Box",
  "clearance": "Clearance",
  "bouncers-13x13": "Bouncers 13x13",
  "package-deals": "Package Deal",
  "art-panels": "Art Panel",
  "accessories": "Accessories",
};

// Format category name for display
const formatCategoryName = (category: string | null): string => {
  if (!category) return "All Products";
  const mapped = categoryMap[category];
  if (mapped) return mapped;
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Filter products based on category
  const filteredProducts = useMemo(() => {
    if (!categoryParam) return mockProducts;

    const categoryName = categoryMap[categoryParam];
    if (!categoryName) return mockProducts;

    return mockProducts.filter(
      (product) => product.category === categoryName
    );
  }, [categoryParam]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return products.sort((a, b) => a.price - b.price);
      case "price-high":
        return products.sort((a, b) => b.price - a.price);
      case "newest":
        return products.sort((a, b) => b.id - a.id);
      case "popular":
        return products.sort((a, b) => (b.badge === "POPULAR" ? 1 : 0) - (a.badge === "POPULAR" ? 1 : 0));
      default:
        return products;
    }
  }, [filteredProducts, sortBy]);

  // Calculate pagination
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const categoryDisplayName = formatCategoryName(categoryParam);

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 xl:px-12 mt-[140px]">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <a href="/" className="transition-colors hover:text-primary-500">
            Home
          </a>
          <ChevronRight className="h-4 w-4" />
          <a href="/shop" className="transition-colors hover:text-primary-500">
            Shop
          </a>
          {categoryParam && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-slate-900">{categoryDisplayName}</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="mb-3 text-5xl font-black text-slate-900">
            {categoryDisplayName}
          </h1>
          <p className="text-xl text-slate-600">
            {categoryParam
              ? `Browse our selection of ${categoryDisplayName.toLowerCase()}`
              : "Premium inflatable products for any celebration"}
          </p>
        </div>

        {/* Main Layout */}
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
                <a
                  href="/shop"
                  className="mt-6 px-6 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 transition-colors"
                >
                  View All Products
                </a>
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
      </div>
    </div>
  );
}
