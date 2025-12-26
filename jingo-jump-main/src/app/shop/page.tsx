import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ShopContent } from "~/app/shop/_components/ShopContent";
import { api } from "~/trpc/server";
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

  // Fetch products from database
  const dbResult = await api.products.list({
    page: 1,
    limit: 100,
    search: searchQuery,
    sortBy: "featured",
  });

  // Convert DB products to Product type
  const products: Product[] = dbResult.products.map((p) => ({
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

  const filterOptions = {
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

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      <div className="mx-auto max-w-[1600px] px-1 pt-2 pb-6 sm:px-4 sm:pt-4 sm:pb-10 lg:px-8 lg:pt-5 lg:pb-12 xl:px-12 mt-[85px] sm:mt-[105px] lg:mt-[125px]">
        {/* Breadcrumb */}
        <nav className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 sm:mb-4 sm:gap-2 sm:text-xs lg:mb-6 lg:text-sm">
          <Link href="/" className="transition-colors hover:text-primary-500">
            Home
          </Link>
          <ChevronRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
          <span className="text-slate-900">Shop</span>
        </nav>

        {/* Page Header */}
        <div className="mb-3 sm:mb-6 lg:mb-8">
          <h1 className="mb-1 text-xl font-black text-slate-900 sm:mb-2 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            All Products
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm md:text-base lg:text-lg xl:text-xl">
            Premium inflatable products for any celebration
          </p>
        </div>

        {/* Main Layout - Client Component handles interactivity */}
        <ShopContent products={products} filterOptions={filterOptions} />
      </div>
    </div>
  );
}
