import React from 'react';

interface SimplifiedMetricFieldProps {
  label: string;
  value: string;
  consensusStrength: number; // 0-100 percentage
}

export const SimplifiedMetricField: React.FC<SimplifiedMetricFieldProps> = ({
  label,
  value,
  consensusStrength
}) => {
  const getBarColor = (percentage: number): string => {
    if (percentage >= 40) return 'bg-green-500 dark:bg-green-600';
    if (percentage >= 30) return 'bg-blue-500 dark:bg-blue-600';
    return 'bg-gray-400 dark:bg-gray-500';
  };

  return (
    <div className="space-y-1">
      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(consensusStrength)}`}
            style={{ width: `${consensusStrength}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{consensusStrength}%</span>
      </div>
    </div>
  );
};