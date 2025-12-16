import Image from "next/image";
import { featuredLooks } from "./data";

export function ShopTheLook() {
  return (
    <section id="shop-the-look" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredLooks.map((look) => (
            <div
              key={look.title}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative h-72 overflow-hidden">
                <Image className="w-full h-full object-cover" src={look.image} alt={look.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{look.title}</h3>
                <p className="text-neutral-600 mb-4">{look.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-500">{look.price}</span>
                  <button className="bg-secondary-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-secondary-600 transition">
                    Get Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
