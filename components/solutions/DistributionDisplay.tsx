// Distribution Display Components for WWFM Goal Page

import { useState } from 'react'

// Types for distribution data
export interface DistributionValue {
  value: string
  count: number
  percentage: number
}

export interface FieldDistribution {
  fieldName: string
  displayLabel: string
  mode: string // Most common value
  values: DistributionValue[]
  totalReports: number
}

// Format distribution data for display (top 3 + others)
export const formatDistribution = (distribution: FieldDistribution) => {
  const sorted = distribution.values.sort((a, b) => b.count - a.count)
  
  // Special handling for different sample sizes
  if (distribution.totalReports === 1) {
    return { 
      values: sorted, 
      showPercentages: false,
      showOthers: false,
      othersPercent: 0
    }
  }
  
  if (distribution.totalReports <= 3) {
    return { 
      values: sorted, 
      showPercentages: true,
      showOthers: false,
      othersPercent: 0
    }
  }
  
  // Standard case: top 3 + others
  const top3 = sorted.slice(0, 3)
  const others = sorted.slice(3)
  const othersPercent = others.reduce((sum, v) => sum + v.percentage, 0)
  
  return {
    values: top3,
    showPercentages: true,
    showOthers: othersPercent > 0,
    othersPercent
  }
}

// Simple View: Just show the mode value
export const SimpleFieldDisplay = ({ 
  label, 
  value 
}: { 
  label: string
  value: string 
}) => (
  <div className="space-y-1">
    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </span>
    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
      {value}
    </span>
  </div>
)

// Detailed View: Show distribution with percentages
export const DistributionField = ({ 
  distribution 
}: { 
  distribution: FieldDistribution 
}) => {
  const formatted = formatDistribution(distribution)
  const isStacked = formatted.values.length > 3 || 
                   formatted.values.some(v => v.value.length > 20)
  
  return (
    <div className="distribution-field mb-4">
      <div className="distribution-label flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {distribution.displayLabel}
        <span className="field-count font-normal text-gray-400">
          ({distribution.totalReports})
        </span>
      </div>
      
      {distribution.totalReports === 1 ? (
        // Single report - just show the value
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {distribution.mode}
        </div>
      ) : (
        // Multiple reports - show distribution
        <div className={`distribution-values flex ${isStacked ? 'flex-col gap-1' : 'flex-wrap gap-x-3 gap-y-1'} text-sm`}>
          {formatted.values.map((value, index) => (
            <span key={index} className="distribution-value text-gray-900 dark:text-gray-100">
              {index > 0 && !isStacked && <span className="text-gray-400 mr-1">•</span>}
              {value.value}
              {formatted.showPercentages && (
                <span className="distribution-percent text-gray-500 dark:text-gray-400 ml-1">
                  ({value.percentage}%)
                </span>
              )}
            </span>
          ))}
          {formatted.showOthers && (
            <span className="distribution-others text-gray-500 dark:text-gray-400 italic">
              {!isStacked && <span className="text-gray-400 mr-1">•</span>}
              others
              <span className="distribution-percent ml-1">
                ({formatted.othersPercent}%)
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Mobile Distribution Display with 📊 icon
export const MobileDistributionField = ({ 
  label,
  value,
  reportCount,
  onTapDetails
}: {
  label: string
  value: string
  reportCount: number
  onTapDetails: () => void
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label} <span className="font-normal text-gray-400">({reportCount})</span>
    </span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%]">
        {value}
      </span>
      {reportCount > 1 && (
        <button
          onClick={onTapDetails}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={`View ${label} distribution`}
        >
          📊
        </button>
      )}
    </div>
  </div>
)

// Bottom Sheet for Mobile Distribution Details
export const DistributionBottomSheet = ({ 
  distribution,
  isOpen,
  onClose 
}: {
  distribution: FieldDistribution | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!distribution) return null
  
  const formatted = formatDistribution(distribution)
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Bottom Sheet */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 
          rounded-t-2xl shadow-xl z-50 lg:hidden
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="px-4 py-6 max-h-[70vh] overflow-y-auto">
          {/* Handle */}
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {distribution.displayLabel}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Based on {distribution.totalReports} reports
          </p>
          
          {/* Distribution Bars */}
          <div className="space-y-3">
            {distribution.values.map((item, index) => {
              const maxCount = Math.max(...distribution.values.map(v => v.count))
              const barWidth = (item.count / maxCount) * 100
              
              return (
                <div key={index} className="bar-item">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.value}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="bar-container bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden">
                    <div 
                      className="bar-fill bg-purple-600 h-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.count} {item.count === 1 ? 'person' : 'people'}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

// Hook to manage distribution sheet state
export const useDistributionSheet = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDistribution, setActiveDistribution] = useState<FieldDistribution | null>(null)
  
  const openSheet = (distribution: FieldDistribution) => {
    setActiveDistribution(distribution)
    setIsOpen(true)
  }
  
  const closeSheet = () => {
    setIsOpen(false)
    // Delay clearing the distribution to allow exit animation
    setTimeout(() => setActiveDistribution(null), 300)
  }
  
  return {
    isOpen,
    activeDistribution,
    openSheet,
    closeSheet
  }
}
