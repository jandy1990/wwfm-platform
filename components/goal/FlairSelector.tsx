'use client';

import { getAllFlairConfigs, type FlairType } from '@/lib/config/flair-types';

interface FlairSelectorProps {
  selectedFlairs: FlairType[];
  onChange: (flairs: FlairType[]) => void;
}

/**
 * FlairSelector - Inline chip selector for adding flairs to a post
 *
 * - Click chips to toggle on/off
 * - Selected chips have filled background
 * - Standard tag/flair UX pattern
 */
export function FlairSelector({ selectedFlairs, onChange }: FlairSelectorProps) {
  const allFlairs = getAllFlairConfigs();

  const toggleFlair = (flairType: FlairType) => {
    if (selectedFlairs.includes(flairType)) {
      onChange(selectedFlairs.filter(f => f !== flairType));
    } else {
      onChange([...selectedFlairs, flairType]);
    }
  };

  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Tag your post (optional)
      </div>
      <div className="flex flex-wrap gap-2">
        {allFlairs.map(({ key, emoji, label, bgClass, textClass, borderClass }) => {
          const isSelected = selectedFlairs.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleFlair(key)}
              className={`
                inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 rounded-full border text-xs sm:text-sm font-medium
                transition-all touch-manipulation
                ${isSelected
                  ? `${bgClass} ${textClass} ${borderClass}`
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95'
                }
              `}
            >
              <span className="text-xs">{emoji}</span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
