"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "~/types/product";
import { useCart } from "~/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  return (
    <Link href={`/shop/${product.id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(15,23,42,0.15)]">
      {/* Product Image */}
      <div className="relative flex h-72 items-center justify-center bg-white">
        {product.badge && (
          <span
            className={`absolute left-4 top-4 z-10 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-lg ${
              product.badge === "NEW"
                ? "bg-fuchsia-600"
                : product.badge === "POPULAR"
                  ? "bg-purple-500"
                  : "bg-red-500"
            }`}
          >
            {product.badge}
          </span>
        )}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={288}
            className="h-full w-full object-contain p-4"
            priority={product.id <= 3}
          />
        ) : (
          <span className="text-sm opacity-70">[Product Image]</span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.5em] text-slate-400">
          {product.category}
        </p>
        <h3 className="mb-2 text-xl font-black text-slate-900">
          {product.name}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-black text-slate-900">
              ${product.price}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Wholesale
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full rounded-xl bg-primary-500 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
