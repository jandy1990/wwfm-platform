export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section Skeleton */}
      <section className="bg-gray-900 dark:bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Heading Skeleton */}
          <div className="text-center mb-8">
            <div className="h-20 md:h-28 w-3/4 mx-auto bg-gray-800 rounded-lg animate-pulse mb-6" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="h-14 bg-gray-800 rounded-full animate-pulse" />
          </div>

          {/* Stats Ticker Skeleton */}
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-10 w-16 bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex justify-center gap-4 mt-8">
            <div className="h-12 w-40 bg-gray-800 rounded-full animate-pulse" />
            <div className="h-12 w-40 bg-gray-800 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Preview Skeleton */}
      <section className="bg-gray-900 dark:bg-black py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-16 w-3/4 mx-auto bg-gray-800 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-1/2 mx-auto bg-gray-800 rounded animate-pulse" />
          </div>

          {/* Solution Cards Skeleton */}
          <div className="space-y-4 max-w-2xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-700 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Goals Skeleton */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
