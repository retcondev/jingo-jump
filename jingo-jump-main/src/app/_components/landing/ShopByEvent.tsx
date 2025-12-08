import { eventCategories } from "./data";

export function ShopByEvent() {
  return (
    <section id="shop-by-event" className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[#1a1a1a] mb-12">Target Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventCategories.map((event) => (
            <div
              key={event.title}
              className="relative h-80 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition transform hover:-translate-y-2"
            >
              <img className="w-full h-full object-cover" src={event.image} alt={event.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-8">
                <h3 className="text-2xl font-bold text-white">{event.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
