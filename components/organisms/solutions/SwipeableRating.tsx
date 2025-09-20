import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import InteractiveRating from './InteractiveRating';

interface SwipeableRatingProps {
  solution: {
    id: string;
    title: string;
    solution_category?: string;
  };
  variant: {
    id: string;
    variant_name: string;
  };
  goalId: string;
  initialRating: number;
  ratingCount: number;
  onRatingUpdate?: (newRating: number, newCount: number) => void;
  isMobile?: boolean;
}

export default function SwipeableRating({
  solution,
  variant,
  goalId,
  initialRating,
  ratingCount,
  onRatingUpdate,
  isMobile = false
}: SwipeableRatingProps) {
  const [showRating, setShowRating] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Swipe handlers for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile) {
        setShowRating(true);
      }
    },
    onSwipedRight: () => {
      if (isMobile) {
        setShowRating(false);
        setHoveredStar(0);
      }
    },
    trackMouse: false // Mobile only
  });

  // For desktop, just pass through to InteractiveRating
  if (!isMobile) {
    return (
      <InteractiveRating
        solution={solution}
        variant={variant}
        goalId={goalId}
        initialRating={initialRating}
        ratingCount={ratingCount}
        onRatingUpdate={onRatingUpdate}
      />
    );
  }

  // Mobile swipeable version
  const handleRate = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // We'll use the InteractiveRating's logic by temporarily showing it
    // and programmatically clicking the star
    const starButton = document.querySelector(`[data-rating-star="${rating}"]`) as HTMLButtonElement;
    if (starButton) {
      starButton.click();
    }
    
    // Hide rating UI after a delay
    setTimeout(() => {
      setShowRating(false);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="relative" {...handlers}>
      {/* Show swipe hint on hover */}
      {isMobile && !showRating && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ← Swipe
        </div>
      )}

      {/* Default rating display */}
      {!showRating ? (
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {initialRating.toFixed(1)}
          </span>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < Math.round(initialRating) ? 'fill-current' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2">
            {ratingCount}
          </span>
        </div>
      ) : (
        /* Swipe revealed rating interface */
        <div className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              data-rating-star={star}
              onTouchStart={() => setHoveredStar(star)}
              onTouchEnd={() => setHoveredStar(0)}
              onClick={() => handleRate(star)}
              disabled={isSubmitting}
              className="p-1 transition-transform active:scale-110"
            >
              <svg
                className={`w-6 h-6 ${
                  star <= hoveredStar 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                } transition-colors`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}