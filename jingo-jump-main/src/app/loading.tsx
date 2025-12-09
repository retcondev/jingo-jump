export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        {/* Branded Logo Skeleton */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-500 animate-pulse">
            <span className="text-2xl font-black text-white">JJ</span>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="h-12 w-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-neutral-600 font-medium">Loading...</p>

        {/* Skeleton Content Blocks */}
        <div className="mt-12 max-w-md mx-auto space-y-4 px-4">
          <div className="h-4 bg-neutral-200 rounded-full w-3/4 mx-auto animate-pulse" />
          <div className="h-4 bg-neutral-200 rounded-full w-1/2 mx-auto animate-pulse" />
          <div className="h-4 bg-neutral-200 rounded-full w-2/3 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
