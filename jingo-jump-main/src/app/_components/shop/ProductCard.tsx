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
  // Use slug if available, otherwise fall back to id
  const productUrl = product.slug ? `/shop/${product.slug}` : `/shop/${product.id}`;

  return (
    <Link href={productUrl} className="group flex min-w-0 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-xl">
      {/* Product Image - Square on mobile with smaller image */}
      <div className="relative flex aspect-square w-full items-center justify-center bg-white p-1 sm:aspect-[4/3] sm:p-2">
        {product.badge && (
          <span
            className={`absolute left-1 top-1 z-10 rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-tight text-white shadow sm:left-2 sm:top-2 sm:px-2 sm:py-0.5 sm:text-[8px] lg:px-2.5 lg:text-[9px] ${
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
          <div className="relative h-[70%] w-[70%] sm:h-[80%] sm:w-[80%] lg:h-[85%] lg:w-[85%]">
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="h-full w-full max-w-full object-contain"
              priority={typeof product.id === "number" && product.id <= 3}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs opacity-70 sm:text-sm">[Product Image]</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col p-1.5 sm:p-2.5 lg:p-3">
        <p className="mb-0.5 truncate text-[7px] font-bold uppercase tracking-wider text-slate-400 sm:text-[8px] lg:text-[9px]">
          {product.category}
        </p>
        <h3 className="mb-0.5 line-clamp-2 text-[10px] font-black leading-tight text-slate-900 sm:mb-1 sm:text-[11px] lg:text-xs">
          {product.name}
        </h3>
        <p className="mb-1.5 hidden text-[9px] leading-snug text-slate-600 sm:line-clamp-2 lg:mb-2 lg:block lg:text-[10px]">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-black text-slate-900 sm:text-sm lg:text-base">
              ${product.price}
            </div>
            <div className="text-[6px] font-bold uppercase tracking-wide text-slate-400 sm:text-[7px] lg:text-[8px]">
              Wholesale
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full rounded bg-primary-500 px-1.5 py-1 text-[8px] font-black uppercase tracking-wide text-white shadow transition-all duration-200 hover:bg-primary-600 active:scale-95 sm:rounded-md sm:px-2 sm:py-1.5 sm:text-[9px] lg:px-3 lg:py-2 lg:text-[10px]"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
