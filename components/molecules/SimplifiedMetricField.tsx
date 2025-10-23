import React from 'react';

interface SimplifiedMetricFieldProps {
  label: string;
  value: string;
  consensusStrength: number; // 0-100 percentage
  count?: number; // Number of users reporting this value
  totalReports?: number; // Total number of reports
}

export const SimplifiedMetricField: React.FC<SimplifiedMetricFieldProps> = ({
  label,
  value,
  consensusStrength,
  count,
  totalReports
}) => {
  const getBarColor = (percentage: number): string => {
    if (percentage >= 40) return 'bg-purple-500 dark:bg-green-600';
    if (percentage >= 30) return 'bg-purple-500 dark:bg-purple-600';
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
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {count && totalReports ? (
            <>{count} of {totalReports} · {consensusStrength}%</>
          ) : (
            <>{consensusStrength}%</>
          )}
        </span>
      </div>
    </div>
  );
};