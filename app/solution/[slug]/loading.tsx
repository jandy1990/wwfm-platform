export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            <span className="text-gray-400">/</span>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <span className="text-gray-400">/</span>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Header skeleton */}
        <div className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                {/* Title skeleton */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 sm:w-80 animate-pulse"></div>
                </div>

                {/* Description skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>

                {/* Badges skeleton */}
                <div className="flex items-center gap-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              </div>

              {/* Stats skeleton */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-6 mt-6 border-b border-gray-200 dark:border-gray-700">
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <main className="mt-6 space-y-6">
          {/* Goals list skeleton */}
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse mb-1"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Similar solutions skeleton */}
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}