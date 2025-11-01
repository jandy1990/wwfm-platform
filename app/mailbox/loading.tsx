export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="animate-pulse">
        {/* Page Header */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
          <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        {/* Retrospective Cards Grid */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Card content */}
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700 rounded" />
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 w-32 bg-purple-200 dark:bg-purple-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
