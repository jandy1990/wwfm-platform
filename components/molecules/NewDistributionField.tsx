import React from 'react';

export interface DistributionValue {
  value: string;
  count: number;
  percentage: number;
}

export interface DistributionData {
  mode: string; // Most common value for simple view
  values: DistributionValue[];
  totalReports: number;
  dataSource?: 'user' | 'ai' | 'mixed'; // Optional source indicator
}

interface NewDistributionFieldProps {
  label: string;
  distribution: DistributionData;
  viewMode: 'simple' | 'detailed';
  isMobile?: boolean;
}

export const NewDistributionField: React.FC<NewDistributionFieldProps> = ({
  label,
  distribution,
  viewMode,
  isMobile = false
}) => {
  // Edge case: Empty arrays
  if (!distribution || distribution.values.length === 0) {
    return (
      <div className="space-y-1">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 italic">
          No {label.toLowerCase()} reported
        </span>
      </div>
    );
  }

  // Simple view: Show top 3 with counts and percentages
  if (viewMode === 'simple') {
    const topValues = distribution.values.slice(0, 3);
    const remainingCount = distribution.values.length - 3;
    
    // Edge case: Single option
    if (distribution.values.length === 1) {
      return (
        <div className="space-y-1">
          <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {distribution.values[0].value}
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              ({distribution.values[0].count} of {distribution.totalReports} users)
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="space-y-1">
          {!isMobile && (
            <div className="text-xs text-gray-500 dark:text-gray-400">Most common:</div>
          )}
          {topValues.map((item, index) => (
            <div key={index} className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.value}
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({item.count} of {distribution.totalReports} users · {item.percentage}%)
              </span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              + {remainingCount} more
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view: Show top 5 with color-coded progress bars
  const topValues = distribution.values.slice(0, 5);
  
  // Smart grouping for low percentage options
  const lowPercentageValues = distribution.values.filter(v => v.percentage < 5);
  const shouldGroupOthers = lowPercentageValues.length >= 5;
  
  let displayValues = topValues;
  let othersData = null;
  
  if (shouldGroupOthers) {
    // Take top 4 and group the rest
    displayValues = distribution.values.slice(0, 4);
    const othersValues = distribution.values.slice(4);
    const othersPercentage = othersValues.reduce((sum, v) => sum + v.percentage, 0);
    othersData = {
      count: othersValues.length,
      percentage: Math.round(othersPercentage)
    };
  }

  // Helper to get color class based on percentage
  const getColorClass = (percentage: number): string => {
    if (percentage >= 40) return 'bg-purple-500 dark:bg-green-600';
    if (percentage >= 20) return 'bg-purple-500 dark:bg-purple-600';
    return 'bg-gray-400 dark:bg-gray-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      
      <div className="space-y-2">
        {displayValues.map((value, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate mr-2">
                {value.value}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                {value.count} users · {value.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ease-out ${getColorClass(value.percentage)}`}
                style={{ width: `${value.percentage}%` }}
              />
            </div>
          </div>
        ))}
        
        {othersData && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400 italic">
                Others ({othersData.count} options)
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                {othersData.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-300 ease-out"
                style={{ width: `${othersData.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};