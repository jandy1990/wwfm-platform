import React from 'react';
import { DistributionData } from '@/components/molecules/DistributionField';

interface DistributionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
  distribution: DistributionData;
}

export const DistributionSheet: React.FC<DistributionSheetProps> = ({
  isOpen,
  onClose,
  fieldName,
  distribution
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl z-50 max-h-[80vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {fieldName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {distribution.totalReports} reports
          </p>
          
          <div className="space-y-3">
            {distribution.values
              .sort((a, b) => b.count - a.count)
              .map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};
