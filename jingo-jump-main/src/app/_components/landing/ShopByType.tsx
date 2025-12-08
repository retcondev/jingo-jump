"use client";

import Link from "next/link";
import { productTypes } from "./data";

export function ShopByType() {
  return (
    <section id="shop-by-type" className="pt-5 pb-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-center text-[#1a1a1a] mb-8">Product Categories</h2>

        {/* 2-Row Grid - 7 items per row */}
        <div className="grid grid-cols-7 gap-4">
          {productTypes.map((product) => (
            <Link
              key={product.title}
              href={product.href}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:-translate-y-2 border-2 border-blue-200 block"
            >
              <div className="h-32 overflow-hidden">
                <img className="w-full h-full object-cover" src={product.image} alt={product.title} />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-xs font-semibold text-[#1a1a1a] leading-tight">{product.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
