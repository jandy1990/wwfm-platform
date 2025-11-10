'use client';

import { useState } from 'react';
import { getAllFlairConfigs } from '@/lib/config/flair-types';
import { FlairBadge } from './FlairBadge';

/**
 * ExamplePostsDisplay - Shows example post snippets in empty Community tab
 *
 * - Displays 3 examples initially (hardcoded from flair config)
 * - "Show more" expands to all 5
 * - Each example shows flair badge + snippet + "Example" label
 * - No database queries - examples are purely UI demonstration
 * - No CTA button (header already has "Add Post" button)
 */
export function ExamplePostsDisplay() {
  const [showAll, setShowAll] = useState(false);

  // Use hardcoded examples from flair config (no database overhead)
  const allExamples = getAllFlairConfigs();
  const displayedExamples = showAll ? allExamples : allExamples.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-0">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-center gap-2">
          <span>💡</span>
          <span>Examples of helpful posts</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          These examples show different ways to share your experience
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {displayedExamples.map(({ key, emoji, label, example }) => (
          <div
            key={key}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <FlairBadge flairType={key} size="sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded flex-shrink-0">
                Example
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "{example}"
            </p>
          </div>
        ))}
      </div>

      {!showAll && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
          >
            + Show {allExamples.length - displayedExamples.length} more examples
          </button>
        </div>
      )}
    </div>
  );
}
