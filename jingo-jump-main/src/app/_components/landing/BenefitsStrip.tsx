const benefits = [
  {
    title: "Exclusive Discounts",
    description: "Members unlock tiered pricing, early drops, and VIP servicing.",
  },
  {
    title: "Free Shipping",
    description: "Complimentary white-glove delivery across the continental US.",
  },
  {
    title: "JEM Concierge",
    description: "On-call stylists to plan layouts, staffing, and content moments.",
  },
];

export function BenefitsStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="grid gap-6 rounded-[2.5rem] border border-slate-100 bg-white px-8 py-10 shadow-[0_20px_55px_rgba(15,23,42,0.08)] md:grid-cols-3">
        {benefits.map((item) => (
          <article key={item.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">
              {item.title}
            </p>
            <p className="text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
