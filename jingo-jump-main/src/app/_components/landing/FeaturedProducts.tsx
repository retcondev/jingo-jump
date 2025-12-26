"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "~/app/_components/shop/ProductCard";
import { api } from "~/trpc/react";
import { parseBadge } from "~/types/product";

export function FeaturedProducts() {
  // Fetch featured products from database
  const { data: productsData } = api.products.list.useQuery({
    page: 1,
    limit: 4,
    sortBy: "featured",
  });

  const featuredProducts = productsData?.products.map((p) => ({
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
  })) ?? [];

  return (
    <section id="featured-products" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-2">
              Featured Products
            </h2>
            <p className="text-lg text-neutral-600">
              Check out our most popular inflatables
            </p>
          </div>
          <Link
            href="/shop"
            className="group hidden md:flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 hover:gap-3"
          >
            View All Products
            <ArrowRight className="w-5 h-5 transition-all duration-300" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 md:hidden flex justify-center">
          <Link
            href="/shop"
            className="group flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 hover:gap-3"
          >
            View All Products
            <ArrowRight className="w-5 h-5 transition-all duration-300" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
