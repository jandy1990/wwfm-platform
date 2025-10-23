'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  text: string
  className?: string
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`inline-flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onClick={(e) => {
          e.preventDefault()
          setShowTooltip(!showTooltip)
        }}
        aria-label="More information"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {showTooltip && (
        <>
          {/* Backdrop for mobile tap-to-close */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setShowTooltip(false)}
          />

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm rounded-lg border-2 border-purple-200 dark:border-purple-700 shadow-lg z-50">
            <p>{text}</p>

            {/* Arrow pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-white dark:border-t-gray-900" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
