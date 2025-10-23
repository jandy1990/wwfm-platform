'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Contributions', href: '/dashboard/contributions', icon: '✨' },
    { name: 'Saved', href: '/dashboard/saved', icon: '🔖' }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Dashboard tabs">
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  group inline-flex items-center gap-2 py-4 px-1
                  border-b-2 font-medium text-sm whitespace-nowrap
                  transition-colors
                  ${
                    active
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
