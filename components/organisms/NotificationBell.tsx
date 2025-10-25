'use client'

import Link from 'next/link'

interface NotificationBellProps {
  count: number
}

export default function NotificationBell({ count }: NotificationBellProps) {
  // Don't render anything if count is 0
  if (count === 0) {
    return null
  }

  return (
    <Link
      href="/mailbox"
      className="relative min-w-[44px] min-h-[44px] flex items-center justify-center
                 text-gray-700 dark:text-gray-300
                 hover:text-purple-600 dark:hover:text-purple-400
                 hover:bg-gray-100 dark:hover:bg-gray-700
                 rounded-md transition-colors
                 focus:outline-none focus:ring-2 focus:ring-purple-500"
      aria-label={`${count} pending retrospective${count !== 1 ? 's' : ''}`}
      title="Pending reflections"
    >
      {/* Bell Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Badge */}
      <span className="absolute -top-0.5 -right-0.5
                     inline-flex items-center justify-center
                     px-2 py-1 text-xs font-bold leading-none
                     text-white bg-red-600 rounded-full
                     ring-2 ring-white dark:ring-gray-800
                     min-w-[20px]">
        {count}
      </span>
    </Link>
  )
}
