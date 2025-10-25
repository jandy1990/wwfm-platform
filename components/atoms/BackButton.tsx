'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallbackHref?: string
  className?: string
  mobileOnly?: boolean
}

export default function BackButton({
  fallbackHref = '/browse',
  className = '',
  mobileOnly = true
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's browser history
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to browse page if no history
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-3 py-3 min-h-[44px]
        text-sm font-semibold text-gray-700 dark:text-gray-300
        hover:text-gray-900 dark:hover:text-gray-100
        hover:bg-gray-100 dark:hover:bg-gray-800
        rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-purple-500
        ${mobileOnly ? 'md:hidden' : ''}
        ${className}
      `}
      aria-label="Go back"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>Back</span>
    </button>
  )
}
