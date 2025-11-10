'use client';

import { useState } from 'react';
import { getAllFlairConfigs } from '@/lib/config/flair-types';

/**
 * FlairHelperPanel - Minimal helper showing flair examples
 *
 * - Small link that expands to show examples
 * - Much more subtle than previous version
 */
export function FlairHelperPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const allFlairs = getAllFlairConfigs();

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        See examples
      </button>
    );
  }

  return (
    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1.5 mb-3">
      {allFlairs.map(({ key, emoji, label, example }) => (
        <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <span className="font-medium flex-shrink-0">{emoji} {label}:</span>
          <span className="italic text-gray-500 dark:text-gray-500">"{example}"</span>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-2 touch-manipulation"
      >
        Hide
      </button>
    </div>
  );
}
