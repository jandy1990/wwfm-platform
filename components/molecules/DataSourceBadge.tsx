import React, { useState } from 'react';
import { Bot, CheckCircle } from 'lucide-react';

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
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200 cursor-help ${className || ''}`}
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
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-100 text-orange-800 border border-orange-200 cursor-help ${className || ''}`}
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
