export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-10 w-10 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-slate-100 px-6 py-4 flex items-center gap-6"
          >
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center mt-8 text-slate-500">
        <div className="relative h-6 w-6 mr-3">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        </div>
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}
