import React from 'react';

export interface SustainabilityData {
  stillFollowingPercentage: number;
  totalResponses: number;
  reasons?: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

interface SustainabilityMetricFieldProps {
  label: string;
  data: SustainabilityData;
  viewMode: 'simple' | 'detailed';
  isMobile?: boolean;
}

export const SustainabilityMetricField: React.FC<SustainabilityMetricFieldProps> = ({
  label,
  data,
  viewMode,
  isMobile = false
}) => {
  const { stillFollowingPercentage, totalResponses } = data;
  
  // Color logic based on percentage
  const getBarColor = (percentage: number): string => {
    if (percentage >= 60) return 'bg-purple-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Calculate number of users still following
  const stillFollowingCount = Math.round(totalResponses * (stillFollowingPercentage / 100));

  // Simple view - just the percentage bar
  if (viewMode === 'simple') {
    return (
      <div className="space-y-1">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {stillFollowingPercentage}% still following
          </span>
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getBarColor(stillFollowingPercentage)}`}
              style={{ width: `${stillFollowingPercentage}%` }}
            />
          </div>
          {!isMobile && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stillFollowingCount} users
            </span>
          )}
        </div>
      </div>
    );
  }

  // Detailed view - show breakdown of reasons
  const stillFollowingReasons = data.reasons?.filter(r => 
    ['Easy to maintain now', 'Takes effort but manageable', 'Getting harder over time', 'Struggling but continuing'].includes(r.reason)
  ) || [];
  
  const stoppedReasons = data.reasons?.filter(r => 
    ['Too hard to sustain', 'No longer needed (problem solved)', 'Found something better', 'Life circumstances changed', 'Other'].includes(r.reason)
  ) || [];

  return (
    <div className="space-y-1">
      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="space-y-2">
        {/* Percentage bar */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {stillFollowingPercentage}% still following
          </span>
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getBarColor(stillFollowingPercentage)}`}
              style={{ width: `${stillFollowingPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalResponses} total
          </span>
        </div>
        
        {/* Detailed breakdown */}
        <div className="mt-3 space-y-2 text-sm">
          {stillFollowingReasons.length > 0 && (
            <div>
              <strong className="text-gray-700 dark:text-gray-300">
                Still following ({stillFollowingPercentage}%):
              </strong>
              {stillFollowingReasons.map(reason => (
                <div key={reason.reason} className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                  • {reason.reason}: {reason.percentage}%
                </div>
              ))}
            </div>
          )}
          
          {stoppedReasons.length > 0 && (
            <div>
              <strong className="text-gray-700 dark:text-gray-300">
                Stopped ({100 - stillFollowingPercentage}%):
              </strong>
              {stoppedReasons.map(reason => (
                <div key={reason.reason} className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                  • {reason.reason}: {reason.percentage}%
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};