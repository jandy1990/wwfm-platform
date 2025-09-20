import { Star } from 'lucide-react'

interface RatingDisplayProps {
  rating: number // Rating out of 5 (effectiveness score)
  reviewCount?: number
  showReviewCount?: boolean
  goalSpecificRating?: number // For showing goal-specific effectiveness
  averageRating?: number // For comparison with goal-specific rating
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function RatingDisplay({
  rating,
  reviewCount,
  showReviewCount = true,
  goalSpecificRating,
  averageRating,
  size = 'md',
  className = ''
}: RatingDisplayProps) {
  // All ratings are now on a 1-5 scale
  const normalizedRating = rating
  const normalizedGoalRating = goalSpecificRating
  const normalizedAverage = averageRating

  // Size configurations
  const sizeConfig = {
    sm: {
      star: 'w-4 h-4',
      text: 'text-sm sm:text-xs',
      mobile: 'text-base sm:text-sm' // Larger on mobile
    },
    md: {
      star: 'w-5 h-5',
      text: 'text-base sm:text-sm',
      mobile: 'text-lg sm:text-base' // Larger on mobile
    },
    lg: {
      star: 'w-6 h-6',
      text: 'text-lg sm:text-base',
      mobile: 'text-xl sm:text-lg' // Larger on mobile
    }
  }

  const config = sizeConfig[size]

  // Render stars based on rating with partial fill support
  const renderStars = (ratingValue: number, className: string = '') => {
    const filledStars = Math.floor(ratingValue)
    const partialFill = (ratingValue % 1) * 100
    const hasPartialStar = partialFill > 0
    const emptyStars = hasPartialStar ? 4 - filledStars : 5 - filledStars
    
    // Generate unique ID for this rating instance
    const gradientId = `star-gradient-${Math.floor(ratingValue * 10)}-${filledStars}-${hasPartialStar ? '1' : '0'}`
    
    return (
      <div className={`flex items-center ${className}`} role="img" aria-label={`${ratingValue.toFixed(1)} out of 5 stars`}>
        <span className="sr-only">Effectiveness rating: </span>
        
        {/* Fully filled stars */}
        {[...Array(filledStars)].map((_, i) => (
          <Star key={`filled-${i}`} className={`${config.star} fill-yellow-400 text-yellow-400 mr-0.5`} />
        ))}
        
        {/* Partial star with gradient */}
        {hasPartialStar && (
          <svg className={`${config.star} mr-0.5`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${partialFill}%`} stopColor="#facc15" />
                <stop offset={`${partialFill}%`} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#${gradientId})`}
              stroke={`url(#${gradientId})`}
              strokeWidth="1"
            />
          </svg>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${config.star} text-gray-300 dark:text-gray-600 mr-0.5`} />
        ))}
      </div>
    )
  }

  // Show goal-specific effectiveness with comparison
  if (goalSpecificRating !== undefined && averageRating !== undefined && normalizedGoalRating !== undefined && normalizedAverage !== undefined) {
    const isHigherThanAverage = goalSpecificRating > averageRating
    const difference = goalSpecificRating - averageRating

    return (
      <div className={`flex flex-col space-y-1 ${className}`}>
        <div className="flex items-center space-x-2">
          {renderStars(normalizedGoalRating)}
          <span className={`font-medium ${config.text} text-gray-900`}>
            {goalSpecificRating.toFixed(1)}
          </span>
          <span className={`${config.text} text-gray-600`}>
            for this goal
          </span>
          {isHigherThanAverage && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-green-600 font-medium">
                +{difference.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <div className={`text-xs sm:${config.text} text-gray-500 dark:text-gray-400`}>
          (avg: {averageRating.toFixed(1)})
        </div>
      </div>
    )
  }

  // Standard rating display
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-semibold ${config.text} text-gray-900 dark:text-gray-100`}>
        {normalizedRating.toFixed(1)}
      </span>
      {renderStars(normalizedRating)}
      {showReviewCount && reviewCount !== undefined && (
        <span className={`${config.text} text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2`}>
          {reviewCount}
        </span>
      )}
    </div>
  )
}

// Helper function to calculate rating from effectiveness scores
export function calculateAverageRating(effectivenessScores: number[]): { average: number; count: number } {
  if (effectivenessScores.length === 0) {
    return { average: 0, count: 0 }
  }
  
  const sum = effectivenessScores.reduce((acc, score) => acc + score, 0)
  const average = sum / effectivenessScores.length
  
  return { average, count: effectivenessScores.length }
}

// Helper function to get the best rating from implementations
export function getBestRating(implementations: Array<{ effectiveness?: number | null; goal_links: Array<{ avg_effectiveness: number | null }> }>): number {
  let bestRating = 0
  
  implementations.forEach(impl => {
    // Check implementation-level effectiveness first
    if (impl.effectiveness && impl.effectiveness > bestRating) {
      bestRating = impl.effectiveness
    }
    
    // Then check goal_links for goal-specific effectiveness
    impl.goal_links.forEach(link => {
      if (link.avg_effectiveness && link.avg_effectiveness > bestRating) {
        bestRating = link.avg_effectiveness
      }
    })
  })
  
  return bestRating
}

// Helper function to get average rating across all implementations
export function getAverageRating(implementations: Array<{ effectiveness?: number | null; goal_links: Array<{ avg_effectiveness: number | null }> }>): { average: number; count: number } {
  const ratings: number[] = []
  
  implementations.forEach(impl => {
    // Use implementation-level effectiveness if available
    if (impl.effectiveness) {
      ratings.push(impl.effectiveness)
    } else {
      // Otherwise use goal_links
      impl.goal_links.forEach(link => {
        if (link.avg_effectiveness) {
          ratings.push(link.avg_effectiveness)
        }
      })
    }
  })
  
  return calculateAverageRating(ratings)
}