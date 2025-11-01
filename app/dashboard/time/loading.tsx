export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          {/* Page Header */}
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />

          {/* Time Tracking Chart/Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

            {/* Chart placeholder */}
            <div className="h-64 w-full bg-gray-100 dark:bg-gray-700 rounded-lg mb-4" />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Arena Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

            {/* Arena rows */}
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
