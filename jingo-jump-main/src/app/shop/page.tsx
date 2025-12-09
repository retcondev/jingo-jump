import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { ShopContent } from "~/app/shop/_components/ShopContent";
import { mockProducts, filterOptions } from "~/data/mockProducts";

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

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category ?? null;
  const categoryName = formatCategoryName(category);

  const title = category
    ? `${categoryName} Bounce Houses & Inflatables`
    : "Shop Commercial Inflatables";

  const description = category
    ? `Browse our premium selection of ${categoryName.toLowerCase()}. Commercial-grade inflatables built for rental businesses and events. Shop now at Jingo Jump.`
    : "Shop premium commercial bounce houses, water slides, combo units & inflatables. Durable designs for rental businesses & events. Browse our full catalog.";

  const canonicalUrl = category
    ? `https://jingojump.com/shop?category=${category}`
    : "https://jingojump.com/shop";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Jingo Jump`,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Jingo Jump",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Jingo Jump`,
      description,
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categoryParam = params.category ?? null;

  // Filter products based on category (server-side)
  const filteredProducts = categoryParam
    ? (() => {
        const categoryName = categoryMap[categoryParam];
        if (!categoryName) return mockProducts;
        return mockProducts.filter(
          (product) => product.category === categoryName
        );
      })()
    : mockProducts;

  const categoryDisplayName = formatCategoryName(categoryParam);

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 pt-[20px] pb-12 sm:px-6 lg:px-8 xl:px-12 mt-[140px]">
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

        {/* Main Layout - Client Component handles interactivity */}
        <ShopContent
          products={filteredProducts}
          filterOptions={filterOptions}
        />
      </div>
    </div>
  );
}
