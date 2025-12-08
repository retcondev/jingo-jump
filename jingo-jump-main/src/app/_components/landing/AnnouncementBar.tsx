export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 text-[0.78rem] font-medium uppercase tracking-[0.25em]">
        <p className="whitespace-nowrap">new gummy bears collection just dropped</p>
        <div className="flex flex-nowrap items-center gap-6 whitespace-nowrap text-white/80">
          <span>Concierge · (555) 219-9987</span>
          <span>Free Nationwide Shipping</span>
          <span>Members save 15%</span>
        </div>
      </div>
    </div>
  );
}
