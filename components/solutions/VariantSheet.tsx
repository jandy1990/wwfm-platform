import React from 'react';
import { GoalSolutionWithVariants } from '@/lib/goal-solutions';

interface VariantSheetProps {
  solution: GoalSolutionWithVariants;
  isOpen: boolean;
  onClose: () => void;
}

export default function VariantSheet({ solution, isOpen, onClose }: VariantSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className={`bottom-sheet ${isOpen ? 'active' : ''}`}>
        <div className="sheet-handle" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {solution.title} Options
        </h3>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {solution.variants.map((variant) => {
            const goalLink = variant.goal_links[0];
            const effectiveness = variant.effectiveness || goalLink?.avg_effectiveness || 0;
            const ratingCount = goalLink?.rating_count || 0;
            
            return (
              <div 
                key={variant.id} 
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {variant.variant_name}
                    </h4>
                    {variant.category_fields && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {Object.entries(variant.category_fields as Record<string, unknown>).map(([key, value]) => {
                          if (!value || key === 'variant_name') return null;
                          const label = key.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ');
                          
                          return (
                            <div key={key}>
                              <span className="font-medium">{label}:</span>{' '}
                              <span>{value.toString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {effectiveness > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {effectiveness.toFixed(1)} ★
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </>
  );
}