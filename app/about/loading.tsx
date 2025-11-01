export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title Skeleton */}
        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-8" />

        {/* Content Sections */}
        <div className="space-y-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              {/* Section Title */}
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4" />

              {/* Section Content */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
