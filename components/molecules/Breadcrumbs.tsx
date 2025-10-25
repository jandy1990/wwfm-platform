'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { BreadcrumbItem } from '@/lib/utils/breadcrumbs'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  // Generate schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && {
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.href}`
      })
    }))
  }

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const isFirst = index === 0
            const hiddenItems = items.filter(i => i.hideOnMobile)
            const showEllipsis = hiddenItems.length > 0 && index === 0

            return (
              <li
                key={index}
                className={`flex items-center ${
                  item.hideOnMobile && !isLast ? 'hidden sm:flex' : 'flex'
                }`}
              >
                {/* Mobile ellipsis menu for hidden items */}
                {showEllipsis && (
                  <div className="sm:hidden relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center
                                 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                                 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label="Show hidden breadcrumbs"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>

                    {showMobileMenu && (
                      <div className="absolute left-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px] py-1">
                        {hiddenItems.map((hiddenItem, hiddenIndex) => (
                          <div key={hiddenIndex}>
                            {hiddenItem.href ? (
                              <Link
                                href={hiddenItem.href}
                                onClick={() => setShowMobileMenu(false)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                {hiddenItem.label}
                              </Link>
                            ) : (
                              <span className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {hiddenItem.label}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Add separator before item (except for first) */}
                {!isFirst && (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 mx-1 sm:mx-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}

                {/* Breadcrumb item */}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline transition-all duration-200 py-2 px-1 -mx-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] flex items-center focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`py-1 px-1 transition-colors duration-200 ${
                      isLast ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}