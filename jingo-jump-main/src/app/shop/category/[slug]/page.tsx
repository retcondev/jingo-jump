import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { api } from "~/trpc/server";
import { ShopContent } from "~/app/shop/_components/ShopContent";
import { parseBadge, type Product } from "~/types/product";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await api.products.getCategoryBySlug({ slug });

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const title = `${category.name} | Shop Jingo Jump`;
  const description =
    category.description ??
    `Browse our premium selection of ${category.name.toLowerCase()}. Commercial-grade inflatables built for rental businesses and events.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://jingojump.com/shop/category/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://jingojump.com/shop/category/${slug}`,
      type: "website",
      siteName: "Jingo Jump",
      ...(category.image && {
        images: [{ url: category.image, alt: category.name }],
      }),
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Fetch category
  const category = await api.products.getCategoryBySlug({ slug });

  if (!category) {
    notFound();
  }

  // Fetch products in this category
  const dbResult = await api.products.list({
    page: 1,
    limit: 100,
    categorySlug: slug,
    sortBy: "featured",
  });

  // Fetch filter options
  const [categories, filterOptionsData] = await Promise.all([
    api.products.getCategories(),
    api.products.getFilterOptions(),
  ]);

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

  const filterOptions = {
    categories: categories.map((c) => ({
      id: c.slug,
      label: c.name,
      count: c.count,
    })),
    sizes: filterOptionsData.sizes.map((s) => ({
      id: s.name.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-"),
      label: s.name,
      count: s.count,
    })),
    ageRanges: filterOptionsData.ageRanges.map((a) => ({
      id: a.name.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-"),
      label: a.name,
      count: a.count,
    })),
    priceRange: filterOptionsData.priceRange,
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      {/* Category Hero */}
      {category.image && (
        <div className="relative h-64 w-full bg-gray-900">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mx-auto max-w-[1600px]">
              <h1 className="text-4xl font-black text-white md:text-5xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 max-w-2xl text-lg text-gray-200">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 pt-5 pb-12 sm:px-6 lg:px-8 xl:px-12 mt-[140px]">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/" className="transition-colors hover:text-primary-500">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="transition-colors hover:text-primary-500">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900">{category.name}</span>
        </nav>

        {/* Page Header (only show if no hero image) */}
        {!category.image && (
          <div className="mb-12">
            <h1 className="mb-3 text-5xl font-black text-slate-900">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-slate-600">{category.description}</p>
            )}
          </div>
        )}

        {/* Products count */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        </div>

        {/* Shop Content */}
        <ShopContent products={products} filterOptions={filterOptions} />
      </div>
    </div>
  );
}
