interface SkeletonProps {
  className?: string
}

// Base skeleton component
function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

// Fade-in animation for content
export function FadeIn({ children, className = '', delay = 0 }: { 
  children: React.ReactNode
  className?: string
  delay?: number 
}) {
  return (
    <div 
      className={`animate-in fade-in duration-500 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Solution card skeleton - mimics the solution display structure
export function SolutionSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-in fade-in duration-300">
      <div className="p-6">
        {/* Solution Header */}
        <div className="mb-4">
          <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
          <Skeleton className="h-4 w-1/2" /> {/* Best variant subtitle */}
        </div>

        {/* Star Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
          </div>
          <Skeleton className="h-4 w-12" /> {/* Rating number */}
          <Skeleton className="h-4 w-20" /> {/* Review count */}
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* Expandable section indicator */}
        <Skeleton className="h-4 w-32" /> {/* "See all variants" text */}
      </div>
    </div>
  )
}

// Goal card skeleton - mimics goal list items
export function GoalSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 animate-in fade-in duration-300">
      <Skeleton className="h-5 w-3/4 mb-2" /> {/* Goal title */}
      
      {/* Description lines */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      {/* Footer with stats */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" /> {/* Solution count */}
        <Skeleton className="h-4 w-24" /> {/* "View solutions" link */}
      </div>
    </div>
  )
}

// Arena card skeleton - mimics arena card structure
export function ArenaSkeleton() {
  return (
    <div className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow animate-in fade-in duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Skeleton className="h-12 w-12 mr-3" /> {/* Icon */}
          <Skeleton className="h-6 w-32" /> {/* Arena name */}
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Stats footer */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" /> {/* Categories count */}
          <Skeleton className="h-4 w-16" /> {/* Goals count */}
        </div>
      </div>
    </div>
  )
}

// Category card skeleton - similar to arena but slightly different
export function CategorySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Skeleton className="h-12 w-12 mr-3" /> {/* Icon */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Skeleton className="h-3 w-16" /> {/* Arena name */}
            <Skeleton className="h-3 w-1" /> {/* Bullet */}
            <Skeleton className="h-3 w-12" /> {/* "Category" text */}
          </div>
          <Skeleton className="h-6 w-40" /> {/* Category name */}
        </div>
      </div>
      
      {/* Goals grid skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" /> {/* Section header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Breadcrumb skeleton
export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-1" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// Header skeleton for pages
export function PageHeaderSkeleton({ showIcon = false }: { showIcon?: boolean }) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {showIcon && <Skeleton className="h-12 w-12 mr-4" />}
        <div className="flex-1">
          {/* Breadcrumb-like elements */}
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-8 w-64 mb-2" /> {/* Page title */}
          <Skeleton className="h-4 w-96" /> {/* Description */}
        </div>
      </div>
    </div>
  )
}

// Search bar skeleton
export function SearchSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

// Grid container for multiple skeletons
interface SkeletonGridProps {
  count?: number
  columns?: 1 | 2 | 3
  children: React.ReactNode
  className?: string
}

export function SkeletonGrid({ 
  count = 3, 
  columns = 3, 
  children, 
  className = '' 
}: SkeletonGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </div>
  )
}

// Vertical list container for skeletons
export function SkeletonList({ 
  count = 4, 
  children, 
  className = '' 
}: { 
  count?: number
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </div>
  )
}

// Complete page loading skeleton
export function PageLoadingSkeleton({ 
  type = 'grid',
  showSearch = false,
  showHeader = true,
  showIcon = false
}: {
  type?: 'grid' | 'list'
  showSearch?: boolean
  showHeader?: boolean
  showIcon?: boolean
}) {
  return (
    <div className="min-h-screen bg-gray-50 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <BreadcrumbSkeleton />
        
        {/* Header */}
        {showHeader && <PageHeaderSkeleton showIcon={showIcon} />}
        
        {/* Search */}
        {showSearch && <SearchSkeleton />}
        
        {/* Content */}
        {type === 'grid' ? (
          <SkeletonGrid count={6}>
            <ArenaSkeleton />
          </SkeletonGrid>
        ) : (
          <SkeletonList count={4}>
            <SolutionSkeleton />
          </SkeletonList>
        )}
      </div>
    </div>
  )
}