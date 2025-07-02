'use client'

import RatingDisplay from '@/components/ui/RatingDisplay'

export default function TestRatingPage() {
  const testRatings = [
    { rating: 5.0, label: "Perfect score" },
    { rating: 4.5, label: "Should show 4.5 stars (not 5)" },
    { rating: 4.2, label: "Should show 4.2 stars (not 4)" },
    { rating: 3.8, label: "Should show 3.8 stars (not 4)" },
    { rating: 3.3, label: "Should show 3.3 stars (not 3)" },
    { rating: 2.7, label: "Should show 2.7 stars (not 3)" },
    { rating: 2.3, label: "Should show 2.3 stars (not 2)" },
    { rating: 1.5, label: "Should show 1.5 stars (not 2)" },
    { rating: 0.8, label: "Should show 0.8 stars (not 1)" },
    { rating: 0.0, label: "No stars" }
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Star Rating Test Page</h1>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Test Cases - Partial Star Display</h2>
        
        <div className="space-y-4">
          {testRatings.map((test, index) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{test.label}</span>
              </div>
              <RatingDisplay rating={test.rating} reviewCount={10} />
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-8">Different Sizes</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Small (4.5 rating)</span>
            </div>
            <RatingDisplay rating={4.5} size="sm" reviewCount={25} />
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium (3.8 rating)</span>
            </div>
            <RatingDisplay rating={3.8} size="md" reviewCount={42} />
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Large (4.2 rating)</span>
            </div>
            <RatingDisplay rating={4.2} size="lg" reviewCount={100} />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-8">Goal-Specific Rating Example</h2>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Goal-specific (4.7) vs Average (3.9)</span>
          </div>
          <RatingDisplay 
            rating={4.7} 
            goalSpecificRating={4.7}
            averageRating={3.9}
            reviewCount={15} 
          />
        </div>
      </div>
    </div>
  )
}