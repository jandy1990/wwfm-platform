export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <div className="h-16 md:h-20 w-3/4 mx-auto bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-6" />
          <div className="h-8 w-1/2 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Example Section Skeleton */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-12 animate-pulse">
          <div className="text-center mb-6">
            <div className="h-12 w-12 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full mb-4" />
            <div className="h-8 w-2/3 mx-auto bg-gray-300 dark:bg-gray-700 rounded mb-2" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Explanation Section Skeleton */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-8 mb-12 animate-pulse">
          <div className="h-8 w-1/2 mx-auto bg-purple-200 dark:bg-purple-800 rounded mb-6" />

          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
              <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            <div className="h-8 w-8 mx-auto bg-purple-200 dark:bg-purple-800 rounded" />

            <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
              <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* Privacy Note Skeleton */}
        <div className="h-6 w-64 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-12" />

        {/* CTA Skeleton */}
        <div className="text-center">
          <div className="h-14 w-48 mx-auto bg-purple-200 dark:bg-purple-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
