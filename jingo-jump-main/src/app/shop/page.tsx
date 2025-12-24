import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ShopContent } from "~/app/shop/_components/ShopContent";
import { api } from "~/trpc/server";
import { mockProducts, filterOptions as mockFilterOptions } from "~/data/mockProducts";
import { parseBadge, categorizeSizeFromDimensions, type Product } from "~/types/product";

interface ShopPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export const metadata: Metadata = {
  title: "Shop Commercial Inflatables",
  description:
    "Shop premium commercial bounce houses, water slides, combo units & inflatables. Durable designs for rental businesses & events. Browse our full catalog.",
  alternates: {
    canonical: "https://jingojump.com/shop",
  },
  openGraph: {
    title: "Shop Commercial Inflatables | Jingo Jump",
    description:
      "Shop premium commercial bounce houses, water slides, combo units & inflatables. Durable designs for rental businesses & events.",
    url: "https://jingojump.com/shop",
    type: "website",
    siteName: "Jingo Jump",
  },
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const searchQuery = params.search ?? undefined;

  // Try to fetch from database
  let products: Product[] = [];
  let filterOptions = mockFilterOptions;
  let useDatabase = false;

  try {
    // Fetch products from database
    const dbResult = await api.products.list({
      page: 1,
      limit: 100,
      search: searchQuery,
      sortBy: "featured",
    });

    if (dbResult.products.length > 0) {
      useDatabase = true;
      // Convert DB products to Product type
      products = dbResult.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.categoryRelation?.name ?? "",
        description: p.description ?? "",
        price: p.price,
        image: p.images[0]?.url,
        gradient: p.gradient,
        badge: parseBadge(p.badge),
        size: p.size,
        ageRange: p.ageRange,
        slug: p.slug,
        salePrice: p.salePrice,
      }));

      // Fetch filter options from database
      const [dbCategories, dbFilterOptions] = await Promise.all([
        api.products.getCategories(),
        api.products.getFilterOptions(),
      ]);

      // Generate size categories from product dimensions
      const sizeCounts = new Map<string, number>([
        ["small", 0],
        ["medium", 0],
        ["large", 0],
      ]);

      products.forEach((product) => {
        const sizeCategory = categorizeSizeFromDimensions(product.size);
        if (sizeCategory) {
          sizeCounts.set(sizeCategory, (sizeCounts.get(sizeCategory) ?? 0) + 1);
        }
      });

      filterOptions = {
        categories: dbCategories.map((c) => ({
          id: c.slug,
          label: c.name,
          count: c.count,
        })),
        sizes: [
          { id: "small", label: "Small", count: sizeCounts.get("small") ?? 0 },
          { id: "medium", label: "Medium", count: sizeCounts.get("medium") ?? 0 },
          { id: "large", label: "Large", count: sizeCounts.get("large") ?? 0 },
        ].filter((s) => s.count > 0),
        ageRanges: dbFilterOptions.ageRanges.map((a) => ({
          id: a.name.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-"),
          label: a.name,
          count: a.count,
        })),
        priceRange: dbFilterOptions.priceRange,
      };
    }
  } catch (error) {
    console.error("Failed to fetch products from database:", error);
  }

  // Fallback to mock data if database is empty or errored
  if (!useDatabase) {
    products = mockProducts;

    // Generate size categories for mock data
    const sizeCounts = new Map<string, number>([
      ["small", 0],
      ["medium", 0],
      ["large", 0],
    ]);

    products.forEach((product) => {
      const sizeCategory = categorizeSizeFromDimensions(product.size);
      if (sizeCategory) {
        sizeCounts.set(sizeCategory, (sizeCounts.get(sizeCategory) ?? 0) + 1);
      }
    });

    filterOptions = {
      ...mockFilterOptions,
      sizes: [
        { id: "small", label: "Small", count: sizeCounts.get("small") ?? 0 },
        { id: "medium", label: "Medium", count: sizeCounts.get("medium") ?? 0 },
        { id: "large", label: "Large", count: sizeCounts.get("large") ?? 0 },
      ].filter((s) => s.count > 0),
    };
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 pt-5 pb-12 sm:px-6 lg:px-8 xl:px-12 mt-[140px]">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/" className="transition-colors hover:text-primary-500">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900">Shop</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="mb-3 text-5xl font-black text-slate-900">
            All Products
          </h1>
          <p className="text-xl text-slate-600">
            Premium inflatable products for any celebration
          </p>
        </div>

        {/* Main Layout - Client Component handles interactivity */}
        <ShopContent products={products} filterOptions={filterOptions} />
      </div>
    </div>
  );
}
