export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        {/* Page Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-6 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        {/* Form Container Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          {/* Form fields skeleton */}
          <div className="space-y-6">
            {/* Solution name input */}
            <div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>

            {/* Category/auto-categorization */}
            <div>
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>

            {/* Rating */}
            <div>
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full" />
                ))}
              </div>
            </div>

            {/* Additional fields */}
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}

            {/* Submit button */}
            <div className="h-12 w-full bg-purple-200 dark:bg-purple-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
