export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Back button skeleton */}
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-6" />

          {/* Header */}
          <div className="mb-8">
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
            <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-5 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Solution info */}
            <div className="mb-6">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                  <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
                </div>
              ))}

              {/* Rating question */}
              <div>
                <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <div className="h-12 w-full bg-purple-200 dark:bg-purple-800 rounded-lg mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
