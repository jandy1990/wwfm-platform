import React, { useState } from 'react';
import { Bot, CheckCircle } from 'lucide-react';

/**
 * Data Source Badge Component
 *
 * ============================================
 * BUSINESS LOGIC: AI vs Human Data Transparency
 * ============================================
 *
 * **The Problem:**
 * Platform has ~3,850 AI-generated solutions to fill gaps. Users deserve to know
 * if effectiveness data comes from real people or AI research.
 *
 * **The Solution:**
 * Visual badges that clearly distinguish data sources:
 *
 * **AI-Generated Mode** (orange badge with robot emoji):
 * - Shows: "AI-Generated 🤖"
 * - Displays progress: "(3/10)" = 3 human ratings, need 10 for verification
 * - Tooltip explains: "Help improve with your real experience!"
 * - Progress bar shows journey to community verification
 * - Gamified messaging: "🥇 Be the first to rate this!"
 *
 * **Community Verified Mode** (green badge with checkmark):
 * - Shows: "Community Verified ✓ (10 users)"
 * - Tooltip: "Verified by real experiences from 10 users like you"
 * - Indicates enough human data to trust the effectiveness scores
 *
 * **Transition Logic:**
 * - Starts as AI-generated (from research data)
 * - At 10+ human ratings: Transitions to "Community Verified"
 * - AI data remains in database but display mode switches
 * - Human ratings now drive the aggregated_fields display
 *
 * **Why This Approach:**
 * - Full transparency: Users always know data source
 * - Encourages contribution: Gamified progress to verification
 * - Builds trust: Honest about AI vs human data
 * - Smooth transition: AI fills gaps, users validate/override
 *
 * **Implementation:**
 * - Mode determined by goal_implementation_links.data_display_mode
 * - Human count from goal_implementation_links.human_rating_count
 * - Default threshold: 10 ratings (configurable)
 *
 * See also:
 * - lib/services/solution-aggregator.ts (aggregation logic)
 * - app/actions/submit-solution.ts (rating creation)
 * - components/goal/GoalPageClient.tsx (display usage)
 */

interface DataSourceBadgeProps {
  mode: 'ai' | 'human';
  humanCount: number;
  threshold?: number;
  className?: string;
}

export function DataSourceBadge({
  mode,
  humanCount,
  threshold = 10,  // Updated default threshold for AI → human transition
  className
}: DataSourceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const progress = (humanCount / threshold) * 100;

  // Gamified progress messages
  const getProgressMessage = () => {
    if (humanCount === 0) return "🥇 Be the first to rate this!";
    if (humanCount === 1) return "🥈 Add the second opinion!";
    if (humanCount === threshold - 1) return "⚡ Your rating unlocks community verification!";
    return `${threshold - humanCount} more needed for community verification`;
  };

  if (mode === 'human') {
    return (
      <div className="relative inline-block">
        <div
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800 border border-green-200 cursor-help ${className || ''}`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Community Verified ✓
          <span className="ml-1 text-xs">({humanCount} users)</span>
        </div>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="space-y-1">
              <p className="font-semibold text-sm">Community Verified</p>
              <p className="text-xs text-gray-600">Verified by real experiences from {humanCount} users like you</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md bg-orange-100 text-orange-800 border border-orange-200 cursor-help ${className || ''}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Bot className="w-3 h-3 mr-1" />
        AI-Generated 🤖
        {humanCount > 0 && (
          <span className="ml-1 text-xs">({humanCount}/{threshold})</span>
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="space-y-2">
            <p className="font-semibold text-sm">AI-Generated Data</p>
            <p className="text-xs text-gray-600">Help improve with your real experience!</p>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  humanCount === threshold - 1
                    ? "bg-orange-500 animate-pulse"
                    : "bg-orange-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs font-medium">
              {getProgressMessage()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
