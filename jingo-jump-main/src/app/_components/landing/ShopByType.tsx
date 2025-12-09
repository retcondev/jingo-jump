"use client";

import Link from "next/link";
import Image from "next/image";
import { productTypes } from "./data";

export function ShopByType() {
  return (
    <section id="shop-by-type" className="pt-5 pb-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-center text-[#1a1a1a] mb-6 sm:mb-8">Product Categories</h2>

        {/* Responsive Grid: 2 cols mobile, 3 cols sm, 4 cols md, 5 cols lg, 7 cols xl */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
          {productTypes.map((product) => (
            <Link
              key={product.title}
              href={product.href}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:-translate-y-2 border-2 border-blue-200 block"
            >
              <div className="relative h-24 sm:h-28 md:h-32 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 14vw"
                />
              </div>
              <div className="p-2 sm:p-3 text-center">
                <h3 className="text-[10px] sm:text-xs font-semibold text-[#1a1a1a] leading-tight line-clamp-2">{product.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
