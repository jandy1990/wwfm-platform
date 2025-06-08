interface RatingDisplayProps {
  rating: number // Rating out of 10 (effectiveness score) or out of 5 (traditional rating)
  maxRating?: 5 | 10 // Maximum possible rating
  reviewCount?: number
  showReviewCount?: boolean
  goalSpecificRating?: number // For showing goal-specific effectiveness
  averageRating?: number // For comparison with goal-specific rating
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function RatingDisplay({
  rating,
  maxRating = 10,
  reviewCount,
  showReviewCount = true,
  goalSpecificRating,
  averageRating,
  size = 'md',
  className = ''
}: RatingDisplayProps) {
  // Convert rating to 5-star scale if needed
  const normalizedRating = maxRating === 10 ? rating / 2 : rating
  const normalizedGoalRating = goalSpecificRating ? (maxRating === 10 ? goalSpecificRating / 2 : goalSpecificRating) : undefined
  const normalizedAverage = averageRating ? (maxRating === 10 ? averageRating / 2 : averageRating) : undefined

  // Size configurations
  const sizeConfig = {
    sm: {
      star: 'text-base sm:text-sm',
      text: 'text-sm sm:text-xs',
      mobile: 'text-base sm:text-sm' // Larger on mobile
    },
    md: {
      star: 'text-lg sm:text-base',
      text: 'text-base sm:text-sm',
      mobile: 'text-lg sm:text-base' // Larger on mobile
    },
    lg: {
      star: 'text-xl sm:text-lg',
      text: 'text-lg sm:text-base',
      mobile: 'text-xl sm:text-lg' // Larger on mobile
    }
  }

  const config = sizeConfig[size]

  // Render stars based on rating
  const renderStars = (ratingValue: number, className: string = '') => {
    return (
      <div className={`flex items-center ${config.star} ${className}`} role="img" aria-label={`${ratingValue.toFixed(1)} out of 5 stars`}>
        <span className="sr-only">Effectiveness rating: </span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${star <= Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} mr-0.5`}
            aria-hidden="true"
          >
            ★
          </span>
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
            {(goalSpecificRating / 2).toFixed(1)}
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
          (avg: {(averageRating / 2).toFixed(1)})
        </div>
      </div>
    )
  }

  // Standard rating display
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {renderStars(normalizedRating)}
      <span className={`font-medium ${config.text} text-gray-900 dark:text-gray-100`}>
        {normalizedRating.toFixed(1)}/5.0
      </span>
      {showReviewCount && reviewCount !== undefined && (
        <span className={`${config.text} text-gray-500 dark:text-gray-400`}>
          ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
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
export function getBestRating(implementations: Array<{ goal_links: Array<{ avg_effectiveness: number | null }> }>): number {
  let bestRating = 0
  
  implementations.forEach(impl => {
    impl.goal_links.forEach(link => {
      if (link.avg_effectiveness && link.avg_effectiveness > bestRating) {
        bestRating = link.avg_effectiveness
      }
    })
  })
  
  return bestRating
}

// Helper function to get average rating across all implementations
export function getAverageRating(implementations: Array<{ goal_links: Array<{ avg_effectiveness: number | null }> }>): { average: number; count: number } {
  const ratings: number[] = []
  
  implementations.forEach(impl => {
    impl.goal_links.forEach(link => {
      if (link.avg_effectiveness) {
        ratings.push(link.avg_effectiveness)
      }
    })
  })
  
  return calculateAverageRating(ratings)
}