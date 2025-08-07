import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

interface InteractiveRatingProps {
  solution: {
    id: string;
    title: string;
    solution_category?: string;
    has_variants?: boolean;
  };
  variant: {
    id: string;
    variant_name: string;
  }; // ✅ REQUIRED: Every rating must be associated with a specific variant
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
  console.log('InteractiveRating state - isHovering:', isHovering);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔧 FIX: Use a unique key to identify this rating instance
  const ratingKey = `${solution.id}-${variant.id}-${goalId}`;
  console.log('Rating key generated:', ratingKey);
  
  // 🔧 FIX: Use ref to persist success state across parent re-renders 
  const successStateRef = useRef({
    hasRated: false,
    timeoutId: null as NodeJS.Timeout | null
  });
  
  // Force re-render when success state changes
  const [, forceUpdate] = useState({});
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successStateRef.current.timeoutId) {
        clearTimeout(successStateRef.current.timeoutId);
      }
    };
  }, []);

  // Check if this solution requires variant-specific rating
  const requiresVariantRating = solution.solution_category && 
    VARIANT_CATEGORIES.includes(solution.solution_category);
  console.log('Requires variant rating:', requiresVariantRating);
  
  // Since variant is now required, we can always rate
  const canRate = true;

  const handleRate = async (rating: number) => {
    if (!canRate || isSubmitting) return;
    
    // ✅ CRITICAL FIX: Ensure we have a valid variant ID
    // (This should never happen since variant is required, but safety check)
    if (!variant.id) {
      console.error('Cannot submit rating: Invalid variant ID. implementation_id must reference solution_variants.id');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    console.log('🔍 Rating attempt:', { solutionId: solution.id, variantId: variant.id, rating, isResubmit: 'checking...' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found - auth check failed');
        setIsSubmitting(false);
        return;
      }

      // 🔍 Check if user has already rated this solution
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('user_id', user.id)
        .eq('solution_id', solution.id)
        .eq('implementation_id', variant.id)
        .eq('goal_id', goalId)
        .single();
      
      const isResubmit = !!existingRating;
      console.log('🔍 Is this a re-rating?', isResubmit);

      // ✅ FIXED: Always use variant.id, never fall back to solution.id
      const ratingData = {
        user_id: user.id,
        solution_id: solution.id,
        implementation_id: variant.id, // This must always be a solution_variants.id
        goal_id: goalId,
        effectiveness_score: rating,
        is_quick_rating: true
      };
      
      console.log('✅ Rating data:', ratingData);
      
      let error;
      if (isResubmit) {
        // Update existing rating
        console.log('🔄 Updating existing rating...');
        const result = await supabase
          .from('ratings')
          .update({ effectiveness_score: rating, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('solution_id', solution.id)
          .eq('implementation_id', variant.id)
          .eq('goal_id', goalId);
        error = result.error;
      } else {
        // Insert new rating  
        console.log('➕ Inserting new rating...');
        const result = await supabase
          .from('ratings')
          .insert(ratingData);
        error = result.error;
      }

      if (error) {
        console.error('Insert error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Don't set hasRated to true if there was an error
        return;
      } else {
        console.log('✅ Rating inserted successfully!');
        // 🔧 FIX: Use ref to persist across re-renders
        successStateRef.current.hasRated = true;
        setHasRated(true); // Also set local state for immediate UI update
        
        // Update parent component if callback provided
        if (onRatingUpdate) {
          const newCount = isResubmit ? ratingCount : ratingCount + 1; // 🔧 Don't increment count for re-ratings
          const newAverage = isResubmit 
            ? ((initialRating * ratingCount) - initialRating + rating) / ratingCount // Replace old rating
            : ((initialRating * ratingCount) + rating) / newCount; // Add new rating
          
          console.log('📊 Callback details:', { isResubmit, oldAvg: initialRating, newAvg: newAverage, oldCount: ratingCount, newCount });
          onRatingUpdate(newAverage, newCount);
        }

        // Clear any existing timeout
        if (successStateRef.current.timeoutId) {
          clearTimeout(successStateRef.current.timeoutId);
        }
        
        // Reset after 2 seconds
        successStateRef.current.timeoutId = setTimeout(() => {
          successStateRef.current.hasRated = false;
          successStateRef.current.timeoutId = null;
          setHasRated(false);
          setIsHovering(false);
          forceUpdate({}); // Force re-render to update UI
        }, 2000);
      }
    } catch (err) {
      console.error('Caught error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Note: Since variant is now required, this component should only be used
  // when we have a specific variant to rate. Parent solutions with multiple variants
  // should use RatingDisplay instead of InteractiveRating.

  return (
    <div 
      className="rating-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoveredStar(0);
      }}
    >
      {/* Default rating display */}
      <div className="rating-content">
        <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">{initialRating.toFixed(1)}</span>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.round(initialRating) ? 'fill-current' : ''}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2">
          {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
        </span>
      </div>

      {/* Hover state with interactive stars */}
      <div className="hover-stars">
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
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= hoveredStar 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 dark:text-gray-500'
              } transition-colors`}
            />
          </button>
        ))}
      </div>

      {/* Success state */}
      {(hasRated || successStateRef.current.hasRated) && (
        <div className="absolute inset-0 flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg z-10">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-2 font-medium text-green-600 dark:text-green-400">Thanks!</span>
        </div>
      )}
    </div>
  );
}