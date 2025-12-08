export function JemClubSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="overflow-hidden rounded-[3rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-12 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.7em] text-slate-400">
          Jem Club
        </p>
        <h2 className="mt-4 text-5xl font-black text-slate-900">JEM CLUB</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
          Empower your rental business with ultra-premium inflatables, on-demand
          styling, member-only drops, and concierge-level servicing. Build a
          destination experience that photographs as good as it rides.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          {[
            "Priority Fulfillment",
            "Launch Marketing Kits",
            "Dedicated Success Team",
          ].map((perk) => (
            <span
              key={perk}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700"
            >
              {perk}
            </span>
          ))}
        </div>
        <button className="mt-10 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white">
          Apply to join
        </button>
      </div>
    </section>
  );
}
