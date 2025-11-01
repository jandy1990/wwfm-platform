export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          {/* Page Title */}
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-8" />

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Form fields */}
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
                </div>
              ))}

              {/* Message field (taller) */}
              <div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
              </div>

              {/* Submit button */}
              <div className="h-12 w-full bg-purple-200 dark:bg-purple-800 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
