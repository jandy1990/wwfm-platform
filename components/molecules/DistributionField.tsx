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
}

interface DistributionFieldProps {
  label: string;
  distribution: DistributionData;
  viewMode: 'simple' | 'detailed';
  onTapBreakdown?: () => void; // For mobile
}

export const DistributionField: React.FC<DistributionFieldProps> = ({
  label,
  distribution,
  viewMode,
  onTapBreakdown
}) => {
  // Simple view: just show the mode value
  if (viewMode === 'simple') {
    return (
      <div className="space-y-1">
        <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          {distribution.mode}
        </span>
      </div>
    );
  }

  // Detailed view: show distribution breakdown
  const formatDistribution = (dist: DistributionData) => {
    const sorted = dist.values.sort((a, b) => b.count - a.count);
    
    // Special handling for different sample sizes
    if (dist.totalReports === 1) {
      return { values: sorted, showPercentages: false, showOthers: false };
    }
    
    if (dist.totalReports <= 3) {
      return { values: sorted, showPercentages: true, showOthers: false };
    }
    
    // Standard case: top 3 + others
    const top3 = sorted.slice(0, 3);
    const others = sorted.slice(3);
    const othersPercent = others.reduce((sum, v) => sum + v.percentage, 0);
    
    return {
      values: top3,
      showPercentages: true,
      showOthers: othersPercent > 0,
      othersPercent: Math.round(othersPercent)
    };
  };

  const formatted = formatDistribution(distribution);
  const isStacked = formatted.values.length > 3 || 
                   formatted.values.some(v => v.value.length > 20);

  return (
    <div className="distribution-field">
      <div className="distribution-label">
        <span>{label}</span>
        <span className="field-count">({distribution.totalReports})</span>
        {/* Mobile tap for breakdown */}
        {onTapBreakdown && (
          <button 
            onClick={onTapBreakdown}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 sm:hidden transition-colors"
            aria-label="View breakdown"
          >
            📊
          </button>
        )}
      </div>
      
      <div className={`distribution-values ${isStacked ? 'stacked' : ''}`}>
        {formatted.values.map((value, index) => (
          <div key={index} className="distribution-value-item">
            <div className="distribution-value-header">
              {index > 0 && !isStacked && <span className="text-gray-400 dark:text-gray-500">• </span>}
              <span className="distribution-value">
                {value.value}
              </span>
              {formatted.showPercentages && (
                <span className="distribution-percent ml-1">
                  ({value.percentage}%)
                </span>
              )}
            </div>
            {/* Progress bar for detailed view */}
            {formatted.showPercentages && (
              <div className="distribution-progress-bar">
                <div 
                  className="distribution-progress-fill"
                  style={{ width: `${value.percentage}%` }}
                  data-percentage={value.percentage}
                />
              </div>
            )}
          </div>
        ))}
        {formatted.showOthers && (
          <div className="distribution-value-item">
            <div className="distribution-value-header">
              <span className="distribution-others">
                {!isStacked && <span className="text-gray-400 dark:text-gray-500">• </span>}
                others <span className="distribution-percent ml-1">({formatted.othersPercent}%)</span>
              </span>
            </div>
            {/* Progress bar for others */}
            <div className="distribution-progress-bar">
              <div 
                className="distribution-progress-fill others"
                style={{ width: `${formatted.othersPercent}%` }}
                data-percentage={formatted.othersPercent}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
