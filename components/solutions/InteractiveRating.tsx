import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

interface InteractiveRatingProps {
  solution: {
    id: string;
    title: string;
    solution_category?: string;
    has_variants?: boolean;
  };
  variant?: {
    id: string;
    variant_name: string;
  };
  goalId: string;
  initialRating: number;
  ratingCount: number;
  onRatingUpdate?: (newRating: number, newCount: number) => void;
}

// Categories that require variant-specific ratings
const VARIANT_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare'];

export default function InteractiveRating({ 
  solution, 
  variant,
  goalId, 
  initialRating, 
  ratingCount,
  onRatingUpdate 
}: InteractiveRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if this solution requires variant-specific rating
  const requiresVariantRating = solution.solution_category && 
    VARIANT_CATEGORIES.includes(solution.solution_category);
  
  // Determine if rating is allowed
  const canRate = requiresVariantRating ? !!variant : true;

  const handleRate = async (rating: number) => {
    if (!canRate || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found - auth check failed');
        setIsSubmitting(false);
        return;
      }

      // Simple insert without checking for existing rating
      const { error } = await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          solution_id: solution.id,
          implementation_id: variant?.id || solution.id,
          goal_id: goalId,
          effectiveness_score: rating,
          is_quick_rating: true
        });

      if (error) {
        console.error('Insert error:', error);
      } else {
        // Success! Update UI
        setHasRated(true);
        
        // Update parent component if callback provided
        if (onRatingUpdate) {
          const newCount = ratingCount + 1;
          const newAverage = ((initialRating * ratingCount) + rating) / newCount;
          onRatingUpdate(newAverage, newCount);
        }

        // Reset after 2 seconds
        setTimeout(() => {
          setHasRated(false);
          setIsHovering(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Caught error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show interactive rating for parent solutions with variants
  if (requiresVariantRating && !variant) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <span className="text-xl font-semibold text-gray-900">{initialRating.toFixed(1)}</span>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.round(initialRating) ? 'fill-current' : ''}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 border-l border-gray-300 pl-2">
          {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
        </span>
      </div>
    );
  }

  return (
    <div 
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoveredStar(0);
      }}
    >
      {/* Default rating display */}
      <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg transition-opacity duration-200 ${isHovering && !hasRated ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-xl font-semibold text-gray-900">{initialRating.toFixed(1)}</span>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.round(initialRating) ? 'fill-current' : ''}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 border-l border-gray-300 pl-2">
          {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
        </span>
      </div>

      {/* Hover state with interactive stars */}
      {isHovering && !hasRated && (
        <div className="absolute inset-0 flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 rounded-lg z-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={(e) => {
                console.log('=== Star clicked ===');
                console.log('Star number:', star);
                e.stopPropagation();
                handleRate(star);
              }}
              disabled={isSubmitting}
              className="p-1 transition-transform hover:scale-110 z-20"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= hoveredStar 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Success state */}
      {hasRated && (
        <div className="absolute inset-0 flex items-center justify-center px-4 py-2 bg-green-100 rounded-lg z-10">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-2 font-medium text-green-600">Thanks!</span>
        </div>
      )}
    </div>
  );
}