'use client'

interface PlatformTransitionBadgeProps {
  transitionPct: number;
  solutionsTransitioned: number;
  solutionsTotal: number;
  retrospectivesTransitioned: number;
  retrospectivesTotal: number;
}

export default function PlatformTransitionBadge({
  transitionPct
}: PlatformTransitionBadgeProps) {
  // Visual minimum of 15% to avoid demotivating empty bar
  // Actual percentage is still tracked correctly in the database
  const visualProgress = Math.max(transitionPct, 15);

  return (
    <div className="flex flex-col items-center">
      {/* Progress Bar (no percentage number shown) */}
      <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${visualProgress}%` }}
        />
      </div>

      {/* Label */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
        🤖→👥 Community Data
      </div>
    </div>
  );
}
