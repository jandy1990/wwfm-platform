export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Nav Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" />
            </div>

            {/* Milestones Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Your Goals Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Impact Dashboard */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              </div>

              {/* Category Mastery */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
              <div className="h-64 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
